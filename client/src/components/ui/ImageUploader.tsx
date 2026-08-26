import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Trash2, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { adminService } from '../../services/adminService';

export interface ImageValue {
  url: string;
  altText?: string;
}

export interface ImageUploaderProps {
  label?: string;
  value: string | ImageValue;
  onChange: (value: { url: string; altText: string }) => void;
  folder?: string;
  placeholder?: string;
  className?: string;
}

export function ImageUploader({
  label = 'Image Asset',
  value,
  onChange,
  folder = 'stitchx_uploads',
  placeholder = 'https://images.unsplash.com/... or upload file',
  className = '',
}: ImageUploaderProps) {
  const currentUrl = typeof value === 'string' ? value : value?.url || '';
  const currentAlt = typeof value === 'string' ? '' : value?.altText || '';

  const [uploading, setUploading] = useState(false);
  const [altText, setAltText] = useState(currentAlt);
  const [urlInput, setUrlInput] = useState(currentUrl);

  React.useEffect(() => {
    setUrlInput(typeof value === 'string' ? value : value?.url || '');
    setAltText(typeof value === 'string' ? '' : value?.altText || '');
  }, [value]);

  const handleUrlChange = (newUrl: string) => {
    setUrlInput(newUrl);
    onChange({ url: newUrl, altText });
  };

  const handleAltChange = (newAlt: string) => {
    setAltText(newAlt);
    onChange({ url: urlInput, altText: newAlt });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Try backend Cloudinary signed upload or direct Cloudinary upload endpoint
      try {
        const sig = await adminService.getCloudinarySignature(folder);
        if (sig?.signature && sig?.cloudName && sig?.apiKey) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('api_key', sig.apiKey);
          formData.append('timestamp', String(sig.timestamp));
          formData.append('signature', sig.signature);
          formData.append('folder', sig.folder || folder);

          const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.secure_url) {
              const uploadedUrl = data.secure_url;
              const generatedAlt = altText || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
              setUrlInput(uploadedUrl);
              setAltText(generatedAlt);
              onChange({ url: uploadedUrl, altText: generatedAlt });
              setUploading(false);
              return;
            }
          }
        }
      } catch (_cloudErr) {
        // Sign API fallback
      }

      // 2. Fallback: Convert file to high-res data URL for reliable local preview & storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        const generatedAlt = altText || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setUrlInput(base64Url);
        setAltText(generatedAlt);
        onChange({ url: base64Url, altText: generatedAlt });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (_err) {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-2 font-sans ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
          <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Cloudinary Enabled
          </span>
        </div>
      )}

      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 space-y-3 shadow-2xs">
        {/* Top: Image Preview Box if URL exists */}
        {urlInput ? (
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative group">
              <img src={urlInput} alt={altText || 'Uploaded asset'} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Image Asset Loaded</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">{urlInput}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setUrlInput('');
                onChange({ url: '', altText });
              }}
              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Remove Image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        {/* Middle: Dual Mode Inputs (URL input + Upload Button) */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
            />
          </div>

          <label className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer shrink-0">
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Image</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Bottom: Alt Text Input for SEO */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-slate-400" /> Image Alt Tag (Required for SEO)
            </span>
          </div>
          <input
            type="text"
            value={altText}
            onChange={(e) => handleAltChange(e.target.value)}
            placeholder="e.g. Navy Blue Double Breasted Italian Wool Suit Front View"
            className="w-full bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>
    </div>
  );
}
