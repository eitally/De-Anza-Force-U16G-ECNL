import React from 'react';
import { InstagramFeaturedPost, InstagramPostData } from './InstagramFeaturedPost';

interface ActionCarouselProps {
  isAdminMode?: boolean;
  className?: string;
  post?: InstagramPostData;
  onSavePost?: (post: InstagramPostData) => void;
}

export const ActionCarousel: React.FC<ActionCarouselProps> = ({
  isAdminMode = false,
  className = '',
  post,
  onSavePost,
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex-1 flex flex-col">
        <InstagramFeaturedPost isAdminMode={isAdminMode} post={post} onSavePost={onSavePost} />
      </div>
    </div>
  );
};

