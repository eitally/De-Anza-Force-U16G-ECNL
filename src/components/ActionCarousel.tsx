import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Maximize2, 
  X, 
  Camera, 
  Sparkles,
  ExternalLink,
  Instagram,
  CheckCircle,
  Copy,
  FolderOpen,
  Settings,
  Image as ImageIcon,
  Compass
} from 'lucide-react';
import type { ActionPhoto, GooglePhotosAlbum, MasterAlbumInfo } from '../types';
import { 
  DEFAULT_ACTION_PHOTOS, 
  DEFAULT_GOOGLE_PHOTOS_ALBUMS, 
  DEFAULT_MASTER_ALBUM_INFO 
} from '../data/defaultData';
import { getSafeImageSrc, handleImageError } from '../utils/imageUtils';
import { InstagramFeaturedPost } from './InstagramFeaturedPost';

export type { ActionPhoto, GooglePhotosAlbum, MasterAlbumInfo };
export { DEFAULT_ACTION_PHOTOS, DEFAULT_GOOGLE_PHOTOS_ALBUMS, DEFAULT_MASTER_ALBUM_INFO };

interface ActionCarouselProps {
  isAdminMode?: boolean;
  photos?: ActionPhoto[];
  albums?: GooglePhotosAlbum[];
  masterAlbumInfo?: MasterAlbumInfo;
  customPhotos?: ActionPhoto[]; // Backwards compatibility
  onOpenPhotoManager?: () => void;
  className?: string;
}

export const ActionCarousel: React.FC<ActionCarouselProps> = ({
  photos: propPhotos,
  albums: propAlbums,
  masterAlbumInfo: propMasterAlbum,
  customPhotos,
  onOpenPhotoManager,
  isAdminMode = false,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'carousel' | 'instagram'>('carousel');

  // Photos state
  const [photos, setPhotos] = useState<ActionPhoto[]>(propPhotos || customPhotos || DEFAULT_ACTION_PHOTOS);

  // Google Photos Albums state
  const [albums, setAlbums] = useState<GooglePhotosAlbum[]>(() => {
    if (propAlbums) return propAlbums;
    const saved = localStorage.getItem('daf_google_photos_albums');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_GOOGLE_PHOTOS_ALBUMS;
  });

  // Master Album Info state
  const [masterAlbum, setMasterAlbum] = useState<MasterAlbumInfo>(() => {
    if (propMasterAlbum && propMasterAlbum.url) return propMasterAlbum;
    const saved = localStorage.getItem('daf_master_album_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.url) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_MASTER_ALBUM_INFO;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedAlbumId, setCopiedAlbumId] = useState<string | null>(null);
  const [copiedMaster, setCopiedMaster] = useState(false);

  // Sync with prop updates
  useEffect(() => {
    if (propPhotos) {
      setPhotos(propPhotos);
    }
  }, [propPhotos]);

  useEffect(() => {
    if (propAlbums) {
      setAlbums(propAlbums);
    }
  }, [propAlbums]);

  useEffect(() => {
    if (propMasterAlbum) {
      setMasterAlbum(propMasterAlbum);
    }
  }, [propMasterAlbum]);

  

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (photos.length || 1));
  }, [photos.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + (photos.length || 1)) % (photos.length || 1));
  }, [photos.length]);

  // Autoplay timer
  useEffect(() => {
    if (!isPlaying || isLightboxOpen || activeTab !== 'carousel' || photos.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide, isLightboxOpen, activeTab, photos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, nextSlide, prevSlide]);

  const handleCopyAlbumLink = (album: GooglePhotosAlbum) => {
    navigator.clipboard.writeText(album.albumUrl);
    setCopiedAlbumId(album.id);
    setTimeout(() => setCopiedAlbumId(null), 2000);
  };

  const handleCopyMasterLink = () => {
    navigator.clipboard.writeText(masterAlbum.url || 'https://linktr.ee/willow_glen_photography');
    setCopiedMaster(true);
    setTimeout(() => setCopiedMaster(false), 2000);
  };

  const currentPhoto = photos[currentIndex] || DEFAULT_ACTION_PHOTOS[0];

  return (
    <div className={`relative ${className}`}>
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between mb-3 bg-white dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            onClick={() => setActiveTab('carousel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-condensed font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'carousel'
                ? 'bg-blue-600 text-slate-900 dark:text-white shadow border border-blue-400/40'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Action Carousel ({photos.length})</span>
          </button>

          <a
            href={masterAlbum.url || 'https://linktr.ee/willow_glen_photography'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-condensed font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 text-[#00ADEF] hover:bg-[#00ADEF]/10 border border-transparent hover:border-[#00ADEF]/40"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Team Photo Hub</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => setActiveTab('instagram')}
            className={`px-3 py-1.5 rounded-lg text-xs font-condensed font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'instagram'
                ? 'bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 text-slate-900 dark:text-white shadow'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram</span>
          </button>
        </div>

        {onOpenPhotoManager && (
          <button
            onClick={onOpenPhotoManager}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Manage photos and albums"
          >
            <Settings className="w-3 h-3" />
            <span>Manage Media</span>
          </button>
        )}
      </div>

      {/* VIEW 1: ACTION PHOTO ROTATING CAROUSEL */}
      {activeTab === 'carousel' && (
        <div 
          className="relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/90 shadow-2xl group select-none"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          {/* Main Aspect Ratio Image Box */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-white dark:bg-slate-900">
            <img
              key={currentPhoto.id || currentIndex}
              src={getSafeImageSrc(currentPhoto.url, DEFAULT_ACTION_PHOTOS[0].url)}
              alt={currentPhoto.title || 'Match action photo'}
              onError={(e) => handleImageError(e, DEFAULT_ACTION_PHOTOS[0].url)}
              className="w-full h-full object-cover object-center transition-all duration-700 ease-out transform group-hover:scale-105"
              referrerPolicy="no-referrer"
            />

            {/* Gradients for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-black/30 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/20 via-transparent to-black/40" />

            {/* Top Bar Overlay */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
              {/* Tag Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/60 text-[#00ADEF] border border-[#00ADEF]/40 backdrop-blur-md shadow-lg">
                  <Sparkles className="w-3 h-3 text-[#00ADEF]" />
                  {currentPhoto.tag || 'Action Spotlight'}
                </span>
                {currentPhoto.date && (
                  <span className="hidden sm:inline-block text-[11px] font-bold text-slate-300 bg-black/50 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700/60 backdrop-blur-sm">
                    {currentPhoto.date}
                  </span>
                )}
              </div>

              {/* Top Right Action Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-blue-600 text-slate-200 hover:text-white border border-white/20 backdrop-blur-md transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                  aria-label="Toggle autoplay"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-blue-600 text-slate-200 hover:text-white border border-white/20 backdrop-blur-md transition-colors cursor-pointer"
                  title="View full screen"
                  aria-label="Fullscreen photo"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Captions & Google Photos Direct Link */}
            <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 flex flex-col justify-end">
              <div className="flex items-end justify-between gap-4">
                <div className="max-w-[78%]">
                  <h3 className="font-condensed font-black text-lg sm:text-2xl text-white uppercase tracking-tight leading-tight drop-shadow-md">
                    {currentPhoto.title}
                  </h3>
                  {currentPhoto.subtitle && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5 drop-shadow">
                      {currentPhoto.subtitle}
                    </p>
                  )}
                </div>

                {/* Photo Counter */}
                <div className="shrink-0 px-2 py-1 rounded-md bg-black/70 border border-slate-200 dark:border-slate-800 text-[11px] font-mono font-bold text-slate-300 backdrop-blur-sm">
                  <span className="text-[#00ADEF] font-black">{currentIndex + 1}</span> / {photos.length}
                </div>
              </div>

              {/* Slide Navigation Progress Indicators & Direct Album Link */}
              <div className="flex items-center justify-between gap-2 mt-3">
                <div className="flex items-center gap-1.5">
                  {photos.map((p, idx) => (
                    <button
                      key={p.id || idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentIndex
                          ? 'w-7 bg-[#00ADEF] shadow-[0_0_8px_#00ADEF]'
                          : 'w-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Permanent Master Album Launch Chip */}
                <a
                  href={masterAlbum.url || 'https://linktr.ee/willow_glen_photography'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white bg-black/60 hover:bg-black px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700/80 backdrop-blur-sm transition-colors"
                >
                  <FolderOpen className="w-3 h-3 text-[#00ADEF]" />
                  <span>Team Album Hub</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#00ADEF]" />
                </a>
              </div>
            </div>

            {/* Previous / Next Arrow Overlays */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-blue-600 text-white border border-slate-300 dark:border-slate-700/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 transform -translate-x-2 group-hover:translate-x-0 cursor-pointer shadow-lg"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-blue-600 text-white border border-slate-300 dark:border-slate-700/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0 cursor-pointer shadow-lg"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: LATEST INSTAGRAM POST */}
      {activeTab === 'instagram' && (
        <div>
          <InstagramFeaturedPost isAdminMode={isAdminMode} />
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-xl animate-fadeIn">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="font-condensed font-black text-xl uppercase tracking-wider text-[#00ADEF]">
                DE ANZA FORCE MATCH GALLERY
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {currentIndex + 1} of {photos.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={masterAlbum.url || 'https://linktr.ee/willow_glen_photography'}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white text-xs font-bold"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Team Photo Hub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-red-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close fullscreen view"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Centered Large Image */}
          <div className="relative flex-1 flex items-center justify-center py-4 max-h-[80vh]">
            <img
              src={getSafeImageSrc(currentPhoto.url, DEFAULT_ACTION_PHOTOS[0].url)}
              alt={currentPhoto.title || 'Match action preview'}
              onError={(e) => handleImageError(e, DEFAULT_ACTION_PHOTOS[0].url)}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800"
              referrerPolicy="no-referrer"
            />

            {/* Floating Nav Controls in Lightbox */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 p-3 rounded-full bg-black/70 hover:bg-blue-600 text-white border border-white/20 transition-all cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 p-3 rounded-full bg-black/70 hover:bg-blue-600 text-white border border-white/20 transition-all cursor-pointer"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Captions & Thumbnails */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-condensed font-black text-xl text-slate-900 dark:text-white uppercase">
                {currentPhoto.title}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {currentPhoto.subtitle || currentPhoto.tag}
              </div>
            </div>

            {/* Thumbnail Ribbon */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-md py-1">
              {photos.map((p, idx) => (
                <button
                  key={p.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'border-[#00ADEF] scale-105 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 opacity-50 hover:opacity-100'
                  }`}
                  aria-label={`Select photo ${idx + 1}`}
                >
                  <img
                    src={getSafeImageSrc(p.url, DEFAULT_ACTION_PHOTOS[0].url)}
                    alt={p.title || `Thumbnail ${idx + 1}`}
                    onError={(e) => handleImageError(e, DEFAULT_ACTION_PHOTOS[0].url)}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
