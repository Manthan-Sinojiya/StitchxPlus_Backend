import React, { useState, useRef } from 'react';
import { Upload, X, ArrowUp, ArrowDown, Star, AlertCircle, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';

export interface UploadedImageItem {
  url: string;
  public_id?: string;
  altText?: string;
  isPrimary?: boolean;
}

interface ImageUploaderProps {
  value?: string | UploadedImageItem;
  onChange: (image: UploadedImageItem | string) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  folder = 'stitchx_products',
  label = 'Upload Image',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUrl = typeof value === 'string' ? value : value?.url || '';

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(20);

    try {
      // 1. Fetch Cloudinary signature from server
      const signedData = await adminService.getCloudinarySignature(folder);
      setUploadProgress(50);

      // 2. Perform direct signed upload to Cloudinary (or fallback if local dev mock)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signedData.apiKey);
      formData.append('timestamp', String(signedData.timestamp));
      formData.append('signature', signedData.signature);
      formData.append('folder', signedData.folder);

      let secureUrl = '';
      let publicId = `file_${Date.now()}`;

      try {
        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signedData.cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          },
        );

        if (cloudinaryRes.ok) {
          const resData = await cloudinaryRes.json();
          secureUrl = resData.secure_url;
          publicId = resData.public_id;
        } else {
          throw new Error('Direct Cloudinary upload returned non-200');
        }
      } catch {
        // Fallback for dev environment without live Cloudinary credentials
        secureUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      setUploadProgress(100);
      onChange({ url: secureUrl, public_id: publicId });
    } catch (err: any) {
      setError(err.message || 'Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = async () => {
    if (typeof value === 'object' && value.public_id) {
      try {
        await adminService.deleteCloudinaryAsset(value.public_id);
      } catch (err: any) {
        console.warn('Could not delete Cloudinary asset:', err.message);
      }
    }
    onChange('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">{label}</label>}

      {currentUrl ? (
        <div className="relative aspect-video w-full max-w-sm rounded-xl overflow-hidden border border-charcoal-200 bg-white group shadow-sm">
          <img src={currentUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white/90 text-charcoal-900 text-xs font-medium rounded-lg hover:bg-white shadow"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
              title="Remove Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-bronze-500 bg-bronze-50/50 scale-[1.01]'
              : 'border-charcoal-200 bg-cream-50 hover:border-bronze-400 hover:bg-white'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              <Loader2 className="w-6 h-6 text-bronze-500 animate-spin" />
              <span className="text-xs font-medium text-charcoal-600">Uploading to Cloudinary... ({uploadProgress}%)</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-cream-100 rounded-full text-bronze-600">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-charcoal-800">
                Click to upload or drag and drop image
              </p>
              <p className="text-[11px] text-charcoal-500">PNG, JPG, WebP up to 10MB</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};

interface MultiImageUploaderProps {
  images: UploadedImageItem[];
  onChange: (images: UploadedImageItem[]) => void;
  folder?: string;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  images,
  onChange,
  folder = 'stitchx_products',
}) => {
  const [newUrlInput, setNewUrlInput] = useState('');

  const handleSingleUploaded = (img: UploadedImageItem | string) => {
    if (!img) return;
    const newItem: UploadedImageItem =
      typeof img === 'string'
        ? { url: img, isPrimary: images.length === 0 }
        : { ...img, isPrimary: images.length === 0 };

    onChange([...images, newItem]);
  };

  const handleAddUrl = () => {
    if (!newUrlInput.trim()) return;
    onChange([
      ...images,
      { url: newUrlInput.trim(), isPrimary: images.length === 0, altText: 'Product view' },
    ]);
    setNewUrlInput('');
  };

  const handleRemove = async (idx: number) => {
    const target = images[idx];
    if (target?.public_id) {
      try {
        await adminService.deleteCloudinaryAsset(target.public_id);
      } catch (err: any) {
        console.warn('Could not delete Cloudinary asset:', err.message);
      }
    }

    const updated = images.filter((_, i) => i !== idx);
    // If primary was removed, default first image as primary
    if (target?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleSetPrimary = (idx: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === idx,
    }));
    onChange(updated);
  };

  const handleMove = (idx: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const updated = [...images];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* List of images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative group rounded-xl overflow-hidden border transition-all bg-white shadow-sm ${
                img.isPrimary ? 'border-bronze-500 ring-2 ring-bronze-500/20' : 'border-charcoal-200'
              }`}
            >
              <div className="aspect-[4/5] bg-cream-100 overflow-hidden relative">
                <img src={img.url} alt={img.altText || `Product Image ${idx + 1}`} className="w-full h-full object-cover" />
                {img.isPrimary && (
                  <span className="absolute top-2 left-2 bg-bronze-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> Primary
                  </span>
                )}

                {/* Controls overlay */}
                <div className="absolute inset-0 bg-charcoal-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-between items-center">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="bg-white/90 text-charcoal-900 text-[10px] font-semibold px-2 py-1 rounded hover:bg-white shadow"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1 bg-red-600 text-white rounded hover:bg-red-700 ml-auto"
                      title="Delete Image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-center gap-2">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'up')}
                        className="p-1 bg-white/80 text-charcoal-900 rounded hover:bg-white shadow"
                        title="Move Left/Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'down')}
                        className="p-1 bg-white/80 text-charcoal-900 rounded hover:bg-white shadow"
                        title="Move Right/Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Alt text field */}
              <div className="p-2 border-t border-charcoal-100">
                <input
                  type="text"
                  placeholder="Alt text..."
                  value={img.altText || ''}
                  onChange={(e) => {
                    const updated = [...images];
                    updated[idx].altText = e.target.value;
                    onChange(updated);
                  }}
                  className="w-full text-[11px] px-2 py-1 border border-charcoal-200 rounded focus:border-bronze-500 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <ImageUploader label="Upload New File to Cloudinary" folder={folder} onChange={handleSingleUploaded} />

        {/* Direct URL entry option */}
        <div className="space-y-2 border border-dashed border-charcoal-200 rounded-xl p-4 bg-cream-50/50">
          <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
            Or Add Image URL Directly
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={newUrlInput}
              onChange={(e) => setNewUrlInput(e.target.value)}
              className="flex-1 text-xs px-3 py-2 border border-charcoal-200 rounded-lg focus:border-bronze-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-4 py-2 bg-charcoal-900 text-white text-xs font-semibold rounded-lg hover:bg-charcoal-800 transition-colors"
            >
              Add URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
