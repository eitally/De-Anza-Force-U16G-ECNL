import fs from 'fs';

const content = `import React, { useState, useEffect } from 'react';
import { FolderOpen, ExternalLink, Instagram, Settings } from 'lucide-react';
import { ActionPhoto, GooglePhotosAlbum, MasterAlbumInfo } from '../types';
import { DEFAULT_ACTION_PHOTOS, DEFAULT_GOOGLE_PHOTOS_ALBUMS, DEFAULT_MASTER_ALBUM_INFO } from '../data';
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
    <div className={\`relative \${className}\`}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-3 bg-white dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            className="px-3 py-1.5 rounded-lg text-xs font-condensed font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-default shrink-0 bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 text-white shadow"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram</span>
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

      {/* LATEST INSTAGRAM POST */}
      <div className="flex-1 flex flex-col">
        <InstagramFeaturedPost isAdminMode={isAdminMode} />
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/ActionCarousel.tsx', content);
