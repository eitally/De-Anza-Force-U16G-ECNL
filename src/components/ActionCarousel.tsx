import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { ActionPhoto, GooglePhotosAlbum, MasterAlbumInfo } from '../types';
import { DEFAULT_MASTER_ALBUM_INFO } from '../data/defaultData';
import { InstagramFeaturedPost } from './InstagramFeaturedPost';

interface ActionCarouselProps {
  photos?: ActionPhoto[];
  albums?: GooglePhotosAlbum[];
  masterAlbumInfo?: MasterAlbumInfo;
  customPhotos?: ActionPhoto[];
  onOpenPhotoManager?: () => void;
  isAdminMode?: boolean;
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

  useEffect(() => {
    if (propMasterAlbum) {
      setMasterAlbum(propMasterAlbum);
    }
  }, [propMasterAlbum]);

  return (
    <div className={`relative ${className}`}>
      {/* Navigation Header */}
      {onOpenPhotoManager && (
        <div className="flex items-center justify-end mb-3 bg-white dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          <button
            onClick={onOpenPhotoManager}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            title="Manage media settings"
          >
            <Settings className="w-3 h-3" />
            <span>Manage Media</span>
          </button>
        </div>
      )}

      {/* LATEST INSTAGRAM POST */}
      <div className="flex-1 flex flex-col">
        <InstagramFeaturedPost isAdminMode={isAdminMode} />
      </div>
    </div>
  );
};
