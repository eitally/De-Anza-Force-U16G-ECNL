import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Maximize2, 
  X, 
  Check, 
  Image as ImageIcon, 
  Link2
} from 'lucide-react';
import {
  compressImage,
  DEFAULT_PLAYER_PHOTO,
  handleImageError,
  getSafeImageSrc,
  transformImageUrl,
  OFFICIAL_SQUAD_PHOTO_URL,
} from '../utils/imageUtils';

interface TeamPhotoManagerProps {
  photoUrl?: string;
  currentPhotoUrl?: string;
  caption?: string;
  currentCaption?: string;
  onUpdate: (photoUrl: string, caption: string) => void;
  onRemove?: () => void;
  onRestoreDefault?: () => void;
  title?: string;
  description?: string;
}

const DEFAULT_CAPTION = 'Spring 2026 Phoenix Showcase Squad';

export const TeamPhotoManager: React.FC<TeamPhotoManagerProps> = ({
  photoUrl,
  currentPhotoUrl,
  caption,
  currentCaption: propCurrentCaption,
  onUpdate,
  title = 'Official Squad Portrait & Team Photo',
  description = 'Change the squad photo using a local image file or an Imgur URL.',
}) => {
  const resolvedInitialUrl = photoUrl ?? currentPhotoUrl ?? OFFICIAL_SQUAD_PHOTO_URL;
  const resolvedInitialCaption = caption ?? propCurrentCaption ?? DEFAULT_CAPTION;

  const [currentUrl, setCurrentUrl] = useState(resolvedInitialUrl);
  // Only show http(s) URLs in the text box—never dump base64 data URLs into the text input
  const [urlInput, setUrlInput] = useState(
    resolvedInitialUrl.startsWith('data:') ? '' : resolvedInitialUrl
  );
  const [currentCaption, setCurrentCaption] = useState(resolvedInitialCaption);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if prop changes externally
  React.useEffect(() => {
    const nextUrl = photoUrl ?? currentPhotoUrl ?? OFFICIAL_SQUAD_PHOTO_URL;
    setCurrentUrl(nextUrl);
    if (!nextUrl.startsWith('data:')) {
      setUrlInput(nextUrl);
    }
    setCurrentCaption(caption ?? propCurrentCaption ?? DEFAULT_CAPTION);
  }, [photoUrl, currentPhotoUrl, caption, propCurrentCaption]);

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    try {
      showToast('Processing squad photo...');
      const compressedDataUrl = await compressImage(file, 1600, 0.82);
      setCurrentUrl(compressedDataUrl);
      setUrlInput('');
      onUpdate(compressedDataUrl, currentCaption);
      showToast('✓ Squad photo updated from file!');
    } catch (e) {
      console.error(e);
      showToast('Failed to process image file.');
    }
  };

  const handleApplyImgurUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      showToast('Please enter an Imgur image URL.');
      return;
    }
    const normalized = transformImageUrl(trimmed);
    setCurrentUrl(normalized);
    setUrlInput(normalized);
    onUpdate(normalized, currentCaption);
    showToast('✓ Squad photo updated from Imgur URL!');
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentCaption(val);
    onUpdate(currentUrl, val);
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
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80">
            {feedbackMsg}
          </span>
        )}
      </div>

      {/* Main Preview & Simplified Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Visual Live Preview Banner */}
        <div className="md:col-span-7">
          <div className="relative aspect-[21/9] sm:aspect-[24/9] rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group shadow-inner">
            {currentUrl ? (
              <>
                <img
                  src={getSafeImageSrc(currentUrl, OFFICIAL_SQUAD_PHOTO_URL)}
                  alt={currentCaption}
                  onError={(e) => handleImageError(e, DEFAULT_PLAYER_PHOTO)}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Overlay Caption & Fullscreen Preview */}
                <div className="absolute bottom-2 inset-x-2 flex items-end justify-between gap-2">
                  <span className="text-[11px] font-condensed font-black text-white truncate drop-shadow-md">
                    {currentCaption}
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white text-xs border border-white/20 transition-colors cursor-pointer"
                    title="View full-size photo"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                <ImageIcon className="w-8 h-8 mb-1.5 opacity-40 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">No squad photo selected</span>
              </div>
            )}
          </div>
        </div>

        {/* Option 1: File Picker & Option 2: Imgur URL */}
        <div className="md:col-span-5 space-y-3.5">
          {/* 1. File Picker */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Option 1: Upload from Computer
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-condensed font-bold text-xs uppercase tracking-wider shadow transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Choose Photo File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = '';
              }}
            />
          </div>

          {/* 2. Imgur URL Input */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Option 2: Imgur Image URL</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="https://i.imgur.com/BPz21Cf.jpeg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyImgurUrl();
                  }
                }}
                className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleApplyImgurUrl}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-condensed font-bold text-xs uppercase tracking-wider cursor-pointer shrink-0 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </div>
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Photo Caption
            </label>
            <input
              type="text"
              placeholder="e.g., Spring 2026 Phoenix Showcase Squad"
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
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-condensed font-black text-xs uppercase">
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
                src={getSafeImageSrc(currentUrl, OFFICIAL_SQUAD_PHOTO_URL)}
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
