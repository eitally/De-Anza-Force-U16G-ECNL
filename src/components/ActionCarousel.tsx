import React from 'react';
import { InstagramFeaturedPost } from './InstagramFeaturedPost';

interface ActionCarouselProps {
  isAdminMode?: boolean;
  className?: string;
}

export const ActionCarousel: React.FC<ActionCarouselProps> = ({
  isAdminMode = false,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex-1 flex flex-col">
        <InstagramFeaturedPost isAdminMode={isAdminMode} />
      </div>
    </div>
  );
};
