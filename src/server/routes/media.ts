import express, { Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { db } from '../lib/db.js';
import { z } from 'zod';

// Extend Request type for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    const uploadDir = path.join(process.cwd(), 'uploads', tenantId);
    
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

// Upload media file
router.post('/upload', upload.single('file'), async (req: MulterRequest, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { category, entityId, altText } = req.body;
    
    const validationSchema = z.object({
      category: z.enum(['service', 'staff', 'gallery', 'product']),
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
        tenantId,
        fileName: processedFileName,
        originalName: req.file.originalname,
        mimeType: 'image/jpeg', // Standardized to JPEG after processing
        fileSize: stats.size,
        filePath: processedPath,
        category: validatedData.category,
        entityId: validatedData.entityId,
        altText: validatedData.altText,
        uploadedBy: req.headers['x-user-email'] as string,
      }
    });

    res.json({
      id: mediaFile.id,
      fileName: mediaFile.fileName,
      originalName: mediaFile.originalName,
      category: mediaFile.category,
      url: `/api/media/file/${mediaFile.id}`,
      altText: mediaFile.altText
    });

  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    });
  }
});

// Get media file
router.get('/file/:id', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const mediaFile = await db.mediaFile.findFirst({
      where: {
        id: req.params.id,
        tenantId,
        isPublic: true
      }
    });

    if (!mediaFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(path.resolve(mediaFile.filePath));

  } catch (error) {
    console.error('Media retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
});

// List media files
router.get('/', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { category, entityId, page = '1', limit = '20' } = req.query;

    const where = {
      tenantId,
      isPublic: true,
      ...(category && { category }),
      ...(entityId && { entityId })
    };

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
      media: mediaWithUrls,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Media list error:', error);
    res.status(500).json({ error: 'Failed to retrieve media files' });
  }
});

// Delete media file
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    const mediaFile = await db.mediaFile.findFirst({
      where: {
        id: req.params.id,
        tenantId
      }
    });

    if (!mediaFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete physical file
    try {
      await fs.unlink(mediaFile.filePath);
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError);
    }

    // Delete database record
    await db.mediaFile.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Media deletion error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
