import express, { Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { db } from '../lib/db.js';
import { logger } from '../lib/logger.js';
import { z } from 'zod';
import { tenantId, requireRole } from '../lib/guards.js';
import { asyncHandler } from '../lib/middleware.js';

// Extend Request type for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const t = tenantId(req);
    const uploadDir = path.join(process.cwd(), 'uploads', t);
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  }
});

// Upload media file (Admin only)
router.post('/upload', requireRole(['owner', 'admin']), upload.single('file'), asyncHandler(async (req: MulterRequest, res) => {
  const t = tenantId(req);
  
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      error: 'No file provided' 
    });
  }

  const { category = 'gallery', entityId, altText } = req.body;
  
  const validationSchema = z.object({
    category: z.enum(['service', 'staff', 'gallery', 'product']).default('gallery'),
    entityId: z.string().optional(),
    altText: z.string().optional()
  });

  const validatedData = validationSchema.parse({ category, entityId, altText });

  // Process image with Sharp for optimization
  const processedFileName = `processed-${req.file.filename}`;
  const processedPath = path.join(path.dirname(req.file.path), processedFileName);
  
  await sharp(req.file.path)
    .resize(1200, 1200, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ quality: 85 })
    .toFile(processedPath);

  // Delete original file
  await fs.unlink(req.file.path);

  const stats = await fs.stat(processedPath);

  // Save to database
  const mediaFile = await db.mediaFile.create({
    data: {
      tenantId: t,
      fileName: processedFileName,
      originalName: req.file.originalname,
      mimeType: 'image/jpeg', // Standardized to JPEG after processing
      fileSize: stats.size,
      filePath: processedPath,
      category: validatedData.category,
      entityId: validatedData.entityId,
      altText: validatedData.altText,
      isPublic: true,
      uploadedBy: req.user?.email || 'admin@dev.local'
    }
  });

  logger.info('Media file uploaded', {
    fileId: mediaFile.id,
    fileName: mediaFile.fileName,
    category: mediaFile.category,
    uploadedBy: req.user?.email
  });

  res.json({
    success: true,
    data: {
      id: mediaFile.id,
      fileName: mediaFile.fileName,
      originalName: mediaFile.originalName,
      category: mediaFile.category,
      url: `/api/media/file/${mediaFile.id}`,
      altText: mediaFile.altText
    }
  });
}));

// Get media file (Public access)
router.get('/file/:id', asyncHandler(async (req, res) => {
  const t = tenantId(req);
  const mediaFile = await db.mediaFile.findFirst({
    where: {
      id: req.params.id,
      tenantId: t,
      isPublic: true
    }
  });

  if (!mediaFile) {
    return res.status(404).json({ 
      success: false,
      error: 'File not found' 
    });
  }

  res.sendFile(path.resolve(mediaFile.filePath));
}));

// List media files (Admin only)
router.get('/', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const t = tenantId(req);
  const { category, entityId, page = '1', limit = '20' } = req.query;

  const where: {
    tenantId: string;
    isPublic: boolean;
    category?: string;
    entityId?: string;
  } = {
    tenantId: t,
    isPublic: true
  };

  if (category && typeof category === 'string') {
    where.category = category;
  }
  
  if (entityId && typeof entityId === 'string') {
    where.entityId = entityId;
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [mediaFiles, total] = await Promise.all([
    db.mediaFile.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        originalName: true,
        category: true,
        entityId: true,
        altText: true,
        fileSize: true,
        createdAt: true
      }
    }),
    db.mediaFile.count({ where })
  ]);

  const mediaWithUrls = mediaFiles.map(file => ({
    ...file,
    url: `/api/media/file/${file.id}`
  }));

  res.json({
    success: true,
    data: {
      media: mediaWithUrls,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
}));

// Update media file (Admin only)
router.put('/:id', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const t = tenantId(req);
  const { altText, category, entityId } = req.body;

  const validationSchema = z.object({
    altText: z.string().optional(),
    category: z.enum(['service', 'staff', 'gallery', 'product']).optional(),
    entityId: z.string().optional()
  });

  const validatedData = validationSchema.parse({ altText, category, entityId });

  const mediaFile = await db.mediaFile.findFirst({
    where: {
      id: req.params.id,
      tenantId: t
    }
  });

  if (!mediaFile) {
    return res.status(404).json({ 
      success: false,
      error: 'File not found' 
    });
  }

  const updatedFile = await db.mediaFile.update({
    where: { id: req.params.id },
    data: validatedData
  });

  logger.info('Media file updated', {
    fileId: updatedFile.id,
    updatedBy: req.user?.email
  });

  res.json({
    success: true,
    data: {
      id: updatedFile.id,
      fileName: updatedFile.fileName,
      originalName: updatedFile.originalName,
      category: updatedFile.category,
      url: `/api/media/file/${updatedFile.id}`,
      altText: updatedFile.altText
    }
  });
}));

// Delete media file (Admin only)
router.delete('/:id', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const t = tenantId(req);
  
  const mediaFile = await db.mediaFile.findFirst({
    where: {
      id: req.params.id,
      tenantId: t
    }
  });

  if (!mediaFile) {
    return res.status(404).json({ 
      success: false,
      error: 'File not found' 
    });
  }

  // Delete physical file
  try {
    await fs.unlink(mediaFile.filePath);
  } catch (fileError) {
    logger.warn('Could not delete physical file:', { error: fileError });
  }

  // Delete database record
  await db.mediaFile.delete({
    where: { id: req.params.id }
  });

  logger.info('Media file deleted', {
    fileId: req.params.id,
    fileName: mediaFile.fileName,
    deletedBy: req.user?.email
  });

  res.json({ 
    success: true,
    message: 'File deleted successfully' 
  });
}));

export default router;
