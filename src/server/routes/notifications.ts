import express from 'express';
import { db } from '../lib/db.js';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

const router = express.Router();

// Email transporter configuration (can be configured via environment variables)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Twilio client for SMS (optional)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Template validation schemas
const templateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['email', 'sms', 'push']),
  event: z.enum(['booking_confirmed', 'booking_reminder', 'booking_cancelled', 'waitlist_available', 'earlier_appointment_available']),
  subject: z.string().optional(),
  bodyText: z.string().min(1),
  bodyHtml: z.string().optional(),
  active: z.boolean().default(true)
});

const sendNotificationSchema = z.object({
  recipient: z.string().email().or(z.string().regex(/^\+?[1-9]\d{1,14}$/)), // Email or phone
  type: z.enum(['email', 'sms']),
  event: z.string(),
  subject: z.string().optional(),
  variables: z.record(z.string()).optional()
});

// Template variable replacement
function replaceVariables(text: string, variables: Record<string, string> = {}): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}

// Send notification function
async function sendNotification(
  tenantId: string,
  recipient: string,
  type: 'email' | 'sms',
  event: string,
  variables: Record<string, string> = {},
  customSubject?: string,
  customBody?: string
) {
  try {
    let template = null;
    let subject = customSubject;
    let body = customBody;

    // Get template if no custom content provided
    if (!customSubject || !customBody) {
      template = await db.notificationTemplate.findFirst({
        where: {
          tenantId,
          event,
          type,
          active: true
        }
      });

      if (!template) {
        throw new Error(`No active template found for event: ${event}, type: ${type}`);
      }

      subject = subject || template.subject || '';
      body = body || template.bodyText;
    }

    // Replace variables in subject and body
    const finalSubject = replaceVariables(subject || '', variables);
    const finalBody = replaceVariables(body || '', variables);

    let status = 'pending';
    let errorMsg = null;

    // Send based on type
    if (type === 'email') {
      try {
        await emailTransporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@schnittwerk.ch',
          to: recipient,
          subject: finalSubject,
          text: finalBody,
          html: template?.bodyHtml ? replaceVariables(template.bodyHtml, variables) : undefined
        });
        status = 'sent';
      } catch (emailError) {
        status = 'failed';
        errorMsg = emailError instanceof Error ? emailError.message : 'Email send failed';
      }
    } else if (type === 'sms' && twilioClient) {
      try {
        await twilioClient.messages.create({
          body: finalBody,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient
        });
        status = 'sent';
      } catch (smsError) {
        status = 'failed';
        errorMsg = smsError instanceof Error ? smsError.message : 'SMS send failed';
      }
    } else {
      status = 'failed';
      errorMsg = 'SMS service not configured';
    }

    // Log notification
    const log = await db.notificationLog.create({
      data: {
        tenantId,
        recipient,
        type,
        event,
        subject: finalSubject,
        body: finalBody,
        status,
        sentAt: status === 'sent' ? new Date() : null,
        errorMsg
      }
    });

    return { success: status === 'sent', logId: log.id, error: errorMsg };

  } catch (error) {
    console.error('Notification send error:', error);
    
    // Log failed notification
    await db.notificationLog.create({
      data: {
        tenantId,
        recipient,
        type,
        event,
        subject: customSubject || '',
        body: customBody || '',
        status: 'failed',
        errorMsg: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Create notification template
router.post('/templates', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const validatedData = templateSchema.parse(req.body);

    const template = await db.notificationTemplate.create({
      data: {
        tenantId,
        ...validatedData
      }
    });

    res.json(template);

  } catch (error) {
    console.error('Template creation error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Template creation failed' 
    });
  }
});

// Get notification templates
router.get('/templates', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { event, type } = req.query;

    const where = {
      tenantId,
      ...(event && { event: event as string }),
      ...(type && { type: type as string })
    };

    const templates = await db.notificationTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(templates);

  } catch (error) {
    console.error('Templates retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve templates' });
  }
});

// Update notification template
router.put('/templates/:id', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const validatedData = templateSchema.partial().parse(req.body);

    const template = await db.notificationTemplate.updateMany({
      where: {
        id: req.params.id,
        tenantId
      },
      data: validatedData
    });

    if (template.count === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Template updated successfully' });

  } catch (error) {
    console.error('Template update error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Template update failed' 
    });
  }
});

// Send notification
router.post('/send', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const validatedData = sendNotificationSchema.parse(req.body);

    const result = await sendNotification(
      tenantId,
      validatedData.recipient,
      validatedData.type,
      validatedData.event,
      validatedData.variables,
      validatedData.subject
    );

    if (result.success) {
      res.json({ 
        message: 'Notification sent successfully', 
        logId: result.logId 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send notification', 
        details: result.error 
      });
    }

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Send failed' 
    });
  }
});

// Get notification logs
router.get('/logs', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { recipient, event, status, page = '1', limit = '50' } = req.query;

    const where = {
      tenantId,
      ...(recipient && { recipient: { contains: recipient as string } }),
      ...(event && { event: event as string }),
      ...(status && { status: status as string })
    };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      db.notificationLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      db.notificationLog.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Logs retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

// Export the send notification function for use by other modules
export { sendNotification };
export default router;
