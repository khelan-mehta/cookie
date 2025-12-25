import { useState, useRef, ChangeEvent } from 'react';
import { FiCamera, FiUpload, FiX, FiImage } from 'react-icons/fi';
import { uploadService } from '../../services/upload';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  onClear?: () => void;
}

export const ImageUpload = ({
  onImageUploaded,
  currentImage,
  onClear,
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Compress and upload
      const compressedFile = await uploadService.compressImage(file);
      const { imageUrl } = await uploadService.uploadDistressImage(compressedFile);
      onImageUploaded(imageUrl);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      setPreview(null);
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    onClear?.();
  };

  if (preview) {
    return (
      <div className="relative">
        <img
          src={preview}
          alt="Preview"
          className="w-full h-48 object-cover rounded-lg"
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <Loader color="text-white" />
          </div>
        )}
        {!isUploading && (
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <FiX className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          variant="secondary"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          <FiCamera className="mr-2 h-5 w-5" />
          Camera
        </Button>

        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          <FiUpload className="mr-2 h-5 w-5" />
          Upload
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center text-gray-500">
          <FiImage className="mx-auto h-8 w-8 mb-2" />
          <p className="text-sm">Take a photo or upload an image</p>
          <p className="text-xs">(Optional but helps with assessment)</p>
        </div>
      </div>
    </div>
  );
};
