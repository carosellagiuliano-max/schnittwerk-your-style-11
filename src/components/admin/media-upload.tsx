import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface MediaFile {
  id: string;
  fileName: string;
  originalName: string;
  category: string;
  url: string;
  altText?: string;
}

interface MediaUploadProps {
  category?: 'service' | 'staff' | 'gallery' | 'product';
  entityId?: string;
  onUploadComplete?: (files: MediaFile[]) => void;
  maxFiles?: number;
  className?: string;
}

export function MediaUpload({
  category = 'gallery',
  entityId,
  onUploadComplete,
  maxFiles = 5,
  className
}: MediaUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, altText?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (entityId) formData.append('entityId', entityId);
    if (altText) formData.append('altText', altText);

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      headers: {
        'x-tenant-id': 't_dev',
        'x-user-email': 'admin@schnittwerk.ch'
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  }, [category, entityId]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const totalFiles = acceptedFiles.length;
      const results: MediaFile[] = [];

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        setUploadProgress(((i + 1) / totalFiles) * 100);
        
        const result = await uploadFile(file);
        results.push(result);
      }

      setUploadedFiles(prev => [...prev, ...results]);
      onUploadComplete?.(results);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [uploadFile, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Media Upload
        </CardTitle>
        <CardDescription>
          Drag & drop images oder klicken Sie zum Auswählen. Max. {maxFiles} Dateien, 10MB pro Datei.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary',
            uploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          
          {isDragActive ? (
            <p className="text-primary font-medium">Dateien hier ablegen...</p>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">
                Bilder hierher ziehen oder klicken zum Auswählen
              </p>
              <p className="text-sm text-gray-500">
                JPEG, PNG, WebP, GIF bis 10MB
              </p>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress.toFixed(0)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Hochgeladene Dateien:</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={file.url}
                      alt={file.altText || file.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/70 text-white text-xs p-1 rounded truncate">
                      {file.originalName}
                    </div>
                  </div>
                  
                  <div className="absolute top-2 left-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Kategorie</Label>
            <Select value={category} disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="gallery">Gallery</SelectItem>
                <SelectItem value="product">Product</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {entityId && (
            <div className="space-y-2">
              <Label htmlFor="entityId">Zugehörig zu</Label>
              <Input value={entityId} disabled />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
