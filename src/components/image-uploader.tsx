
// src/components/image-uploader.tsx
import React from 'react';
import { useS3Upload } from '@/hooks/useS3Upload';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  buttonVariant?: "outline" | "default";
  buttonSize?: "sm" | "default";
}

export function ImageUploader({ 
  onUploadSuccess,
  buttonVariant = "outline",
  buttonSize = "sm",
}: ImageUploaderProps) {
  const { uploadFile, isUploading, error } = useS3Upload();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const permanentUrl = await uploadFile(file);
    if (permanentUrl) {
      onUploadSuccess(permanentUrl);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={isUploading}
      />
      <Button onClick={handleClick} disabled={isUploading} variant={buttonVariant} size={buttonSize} className="text-xs">
        <Upload className="w-3 h-3 mr-1" />
        {isUploading ? '업로드 중...' : '파일 선택'}
      </Button>
      {error && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}
