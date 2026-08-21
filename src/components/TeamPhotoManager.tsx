import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Maximize2, 
  X, 
  Check, 
  Image as ImageIcon, 
  Sparkles,
  Link2,
  AlertCircle
} from 'lucide-react';
import { compressImage, DEFAULT_PLAYER_PHOTO, handleImageError, getSafeImageSrc } from '../utils/imageUtils';

interface TeamPhotoManagerProps {
  photoUrl?: string;
  currentPhotoUrl?: string;
  caption?: string;
  currentCaption?: string;
  onUpdate: (photoUrl: string, caption: string) => void;
  onRemove: () => void;
  onRestoreDefault?: () => void;
  title?: string;
  description?: string;
}

const SAMPLE_TEAM_PHOTO = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&auto=format&fit=crop&q=80';
const DEFAULT_CAPTION = '2026-2027 De Anza Force U16 ECNL Squad & Coaching Staff';

export const TeamPhotoManager: React.FC<TeamPhotoManagerProps> = ({
  photoUrl,
  currentPhotoUrl,
  caption,
  currentCaption: propCurrentCaption,
  onUpdate,
  onRemove,
  onRestoreDefault,
  title = 'Official Squad Portrait & Team Photo',
  description = 'Displayed in the squad showcase header banner above the roster and featured in the media archives.',
}) => {
  const initialUrl = photoUrl ?? currentPhotoUrl ?? '';
  const initialCaption = caption ?? propCurrentCaption ?? DEFAULT_CAPTION;
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [currentCaption, setCurrentCaption] = useState(initialCaption);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if prop changes externally
  React.useEffect(() => {
    setCurrentUrl(photoUrl ?? currentPhotoUrl ?? '');
    setCurrentCaption(caption ?? propCurrentCaption ?? DEFAULT_CAPTION);
  }, [photoUrl, currentPhotoUrl, caption, propCurrentCaption]);

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Please upload an image file (JPEG, PNG, WebP).');
      return;
    }

    try {
      showToast('Compressing image...');
      const compressedDataUrl = await compressImage(file, 1600, 0.75);
      setCurrentUrl(compressedDataUrl);
      onUpdate(compressedDataUrl, currentCaption);
      showToast('✓ Squad photo uploaded successfully!');
    } catch (e) {
      console.error(e);
      showToast('⚠️ Failed to compress image.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentUrl(val);
    onUpdate(val, currentCaption);
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentCaption(val);
    onUpdate(currentUrl, val);
  };

  const handleRemovePhoto = () => {
    setCurrentUrl('');
    onRemove();
    showToast('✓ Squad photo removed.');
  };

  const handleRestoreSample = () => {
    setCurrentUrl(SAMPLE_TEAM_PHOTO);
    setCurrentCaption(DEFAULT_CAPTION);
    if (onRestoreDefault) {
      onRestoreDefault();
    } else {
      onUpdate(SAMPLE_TEAM_PHOTO, DEFAULT_CAPTION);
    }
    showToast('✓ Restored sample squad portrait.');
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-[#00ADEF]">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-condensed font-black text-lg uppercase text-slate-900 dark:text-white tracking-wide">
              {title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {feedbackMsg && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80 animate-in fade-in">
            {feedbackMsg}
          </span>
        )}
      </div>

      {/* Main Preview & Dropzone */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        
        {/* Visual Live Preview Banner */}
        <div className="md:col-span-7 flex flex-col justify-between">
          <div className="relative aspect-[21/9] sm:aspect-[24/9] rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group shadow-inner">
            {currentUrl ? (
              <>
                <img
                  src={getSafeImageSrc(currentUrl, SAMPLE_TEAM_PHOTO)}
                  alt={currentCaption}
                  onError={(e) => handleImageError(e, DEFAULT_PLAYER_PHOTO)}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Overlay Caption & Controls */}
                <div className="absolute bottom-2 inset-x-2 flex items-end justify-between gap-2">
                  <span className="text-[11px] font-condensed font-black text-slate-900 dark:text-white truncate drop-shadow-md">
                    {currentCaption}
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-slate-900 dark:text-white text-xs border border-white/20 transition-colors cursor-pointer"
                    title="View full-size photo"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                <ImageIcon className="w-8 h-8 mb-1.5 opacity-40 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">No squad photo currently assigned</span>
                <span className="text-[10px] text-slate-600 mt-0.5">Upload a photo file or paste an image URL below</span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-condensed font-bold text-xs uppercase tracking-wider shadow transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{currentUrl ? 'Replace Photo File' : 'Upload Photo File'}</span>
            </button>

            {currentUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-slate-900 dark:hover:text-white font-condensed font-bold text-xs uppercase tracking-wider border border-red-800/80 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRestoreSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-condensed font-bold text-xs uppercase tracking-wider border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span>Restore Sample</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Upload Zone + Direct Inputs */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-3">
          
          {/* Drag & Drop Box */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragOver 
                ? 'border-blue-500 bg-blue-950/40 text-blue-300 scale-[1.02]' 
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-500/80 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400'
            }`}
          >
            <Upload className={`w-6 h-6 mb-1.5 transition-colors ${isDragOver ? 'text-blue-400' : 'text-slate-500'}`} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Drag & Drop squad photo here
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              or click to browse from your computer (PNG, JPG, WebP)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {/* Direct URL Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Link2 className="w-3 h-3 text-blue-400" />
              <span>Or Direct Web Image URL</span>
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or web image link"
              value={currentUrl}
              onChange={handleUrlChange}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:border-blue-500"
            />
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Team Photo Caption / Title
            </label>
            <input
              type="text"
              placeholder="e.g., 2026-2027 De Anza Force U16 ECNL Squad & Coaching Staff"
              value={currentCaption}
              onChange={handleCaptionChange}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
            />
          </div>

        </div>

      </div>

      {/* High Res Lightbox Modal */}
      {isLightboxOpen && currentUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-5xl w-full bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-slate-900 dark:text-white font-condensed font-black text-xs uppercase">
                  Full Resolution Preview
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {currentCaption}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video max-h-[75vh] overflow-auto bg-black flex items-center justify-center">
              <img
                src={currentUrl}
                alt={currentCaption}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>De Anza Force U16 ECNL</span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
