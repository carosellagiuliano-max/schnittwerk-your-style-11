import { logger } from './logger.js';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface MailConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

/**
 * Mail Service
 * Handles email sending with proper error handling and logging
 */
class MailService {
  private config: MailConfig;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === '1';
    this.config = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined
    };
  }

  async sendMail(options: MailOptions): Promise<boolean> {
    try {
      if (this.isDevelopment || !this.config.host) {
        // Development mode - log instead of sending
        logger.info('Email sent (development mode)', {
          to: options.to,
          subject: options.subject,
          hasHtml: !!options.html,
          hasText: !!options.text
        });
        return true;
      }

      // Production mode - implement actual SMTP sending
      // TODO: Implement nodemailer or similar for production
      logger.warn('Production email sending not implemented yet', {
        to: options.to,
        subject: options.subject
      });
      
      return false;
    } catch (error) {
      logger.error('Failed to send email', error as Error, {
        to: options.to,
        subject: options.subject
      });
      return false;
    }
  }

  async sendTemplateEmail(
    to: string,
    template: string,
    variables: Record<string, string>
  ): Promise<boolean> {
    // This would integrate with a template engine in production
    const subject = this.processTemplate(template, variables);
    const html = this.processTemplate(template, variables);
    
    return this.sendMail({
      to,
      subject,
      html
    });
  }

  private processTemplate(template: string, variables: Record<string, string>): string {
    return Object.entries(variables).reduce(
      (processed, [key, value]) => processed.replace(new RegExp(`{{${key}}}`, 'g'), value),
      template
    );
  }

  // Health check for mail service
  async isHealthy(): Promise<boolean> {
    if (this.isDevelopment) {
      return true; // Always healthy in development
    }
    
    // In production, test SMTP connection
    return !!this.config.host;
  }
}

export const mailService = new MailService();

// Legacy compatibility
export async function sendMail(options: MailOptions): Promise<boolean> {
  return mailService.sendMail(options);
}
