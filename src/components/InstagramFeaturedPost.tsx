import React, { useState, useEffect } from 'react';
import { db, TEAM_DATA_DOC } from '../lib/firebase';
import { onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { 
  Instagram, 
  Heart, 
  MessageCircle, 
  Share2, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  Edit3,
  X,
  Layers,
  Globe,
  RefreshCw
} from 'lucide-react';
import { getSafeImageSrc, handleImageError } from '../utils/imageUtils';

export interface InstagramPostData {
  id: string;
  accountHandle: string;
  accountName: string;
  profilePicUrl: string;
  postImageUrl: string;
  caption: string;
  likes: number;
  commentsCount: number;
  postedDate: string;
  postUrl: string;
  embedPostId?: string; // e.g. "C8_ABC123"
}

export const DEFAULT_INSTAGRAM_POST: InstagramPostData = {
  id: 'ig-post-latest',
  accountHandle: 'deanzaforce_2011g_ecnl',
  accountName: 'De Anza Force U16 ECNL',
  profilePicUrl: '/daf-logo.svg',
  postImageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
  caption: 'Big weekend for Force U16 ECNL! 💪⚽ Incredible teamwork, relentless pressing, and high-tempo possession to take all 3 points in Northern California Conference play. Huge clean sheet performance by the backline & GK! Ready for the upcoming national showcase in San Diego 🌴🔥 #DeAnzaForce #ECNL #G2011 #ForceNation #NorCalECNL #GirlsECNL #BayAreaSoccer #ClubSoccer',
  likes: 342,
  commentsCount: 28,
  postedDate: '2 DAYS AGO',
  postUrl: 'https://www.instagram.com/deanzaforce_2011g_ecnl/',
  embedPostId: 'DB-o1yBSe0n', // sample recent post ID
};

interface InstagramFeaturedPostProps {
  isAdminMode?: boolean;
  post?: InstagramPostData;
  className?: string;
}

export const InstagramFeaturedPost: React.FC<InstagramFeaturedPostProps> = ({
  post = DEFAULT_INSTAGRAM_POST,
  className = '',
  isAdminMode = false,
}) => {
  const [postData, setPostData] = useState<InstagramPostData>(post);

  const [viewMode, setViewMode] = useState<'iframe' | 'card'>('iframe');
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(postData.likes);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(postData.caption);
  const [editImageUrl, setEditImageUrl] = useState(postData.postImageUrl);
  const [editPostUrl, setEditPostUrl] = useState(postData.postUrl);
  const [editEmbedPostId, setEditEmbedPostId] = useState(postData.embedPostId || 'DB-o1yBSe0n');
  const [iframeKey, setIframeKey] = useState(Date.now());

  // Listen for Firebase updates
  useEffect(() => {
    const unsubscribe = onSnapshot(TEAM_DATA_DOC, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.featuredInstagramPost) {
          setPostData(data.featuredInstagramPost);
          setLikeCount(data.featuredInstagramPost.likes || 342);
          setIframeKey(Date.now());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLike = () => {
    if (hasLiked) {
      setHasLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setHasLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  // Helper to extract Instagram post ID from URL
  const extractPostId = (url: string): string | null => {
    const match = url.match(/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const extracted = extractPostId(editPostUrl);
    const updated: InstagramPostData = {
      ...postData,
      caption: editCaption,
      postImageUrl: editImageUrl || postData.postImageUrl,
      postUrl: editPostUrl || postData.postUrl,
      embedPostId: extracted || editEmbedPostId || postData.embedPostId || 'DB-o1yBSe0n',
    };
    setPostData(updated);
    setDoc(TEAM_DATA_DOC, { featuredInstagramPost: updated }, { merge: true });
    setIframeKey(Date.now());
    setIsEditing(false);
  };

  const currentEmbedPostId = postData.embedPostId || extractPostId(postData.postUrl) || 'DB-o1yBSe0n';
  const iframeSrc = `https://www.instagram.com/p/${currentEmbedPostId}/embed/captioned/`;

  return (
    <div className={`rounded-2xl bg-white dark:bg-[#090d18] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden ${className}`}>
      {/* Instagram Header Bar */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {/* Avatar with Instagram Gradient Ring */}
          <a 
            href={postData.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:scale-105 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 p-0.5 overflow-hidden flex items-center justify-center">
              <img 
                src="/daf-logo.svg" 
                alt="De Anza Force Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </a>

          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <a
                href={postData.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-[#00ADEF] transition-colors"
              >
                @{postData.accountHandle}
              </a>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400 text-slate-900" />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {postData.accountName} • Latest Team Post
            </div>
          </div>
        </div>

        {/* View Toggle & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 text-[11px] font-bold">
            <button
              onClick={() => setViewMode('iframe')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'iframe'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-slate-900 dark:text-white shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
              }`}
            >
              Instagram Embed
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-blue-600 text-slate-900 dark:text-white shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
              }`}
            >
              Custom Card
            </button>
          </div>

          <a
            href={postData.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-slate-900 dark:text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Open Page</span>
          </a>

          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors"
            title="Edit Instagram Embed & Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: OFFICIAL INSTAGRAM EMBED (IFRAME) */}
      {viewMode === 'iframe' && (
        <div className="p-3 bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
          <div className="w-full max-w-[480px] rounded-xl overflow-hidden bg-black/40 border border-slate-200 dark:border-slate-800 shadow-inner">
            <iframe
              key={iframeKey}
              src={iframeSrc}
              className="w-full h-[460px] sm:h-[500px] border-0 rounded-xl bg-white dark:bg-[#090d18]"
              allow="encrypted-media; autoplay; clipboard-write; picture-in-picture"
              title={`Instagram post from @${postData.accountHandle}`}
            />
          </div>
          
          <div className="w-full flex items-center justify-between px-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Post Embed: @{postData.accountHandle}</span>
            </div>
            <a
              href={postData.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00ADEF] hover:underline flex items-center gap-1 font-bold"
            >
              <span>View on Instagram</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: INTERACTIVE CUSTOM CARD */}
      {viewMode === 'card' && (
        <div>
          {/* Post Photo */}
          <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-slate-50 dark:bg-slate-950 overflow-hidden group">
            <img
              src={getSafeImageSrc(postData.postImageUrl, DEFAULT_INSTAGRAM_POST.postImageUrl)}
              alt="Instagram Post"
              onError={(e) => handleImageError(e, DEFAULT_INSTAGRAM_POST.postImageUrl)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />

            {/* Subtle Gradient & Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60" />

            {/* View on Instagram Floating Pill */}
            <a
              href={postData.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-slate-900 dark:text-white text-[11px] font-bold border border-slate-300 dark:border-slate-700/80 backdrop-blur-md inline-flex items-center gap-1.5 transition-all shadow-lg hover:border-pink-500"
            >
              <span>View on Instagram</span>
              <ExternalLink className="w-3 h-3 text-pink-400" />
            </a>
          </div>

          {/* Interactive Engagement Bar */}
          <div className="p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className={`transition-transform active:scale-125 cursor-pointer ${
                    hasLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  aria-label="Like post"
                >
                  <Heart className={`w-5 h-5 ${hasLiked ? 'fill-rose-500' : ''}`} />
                </button>

                <a
                  href={postData.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="Comment on Instagram"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>

                <a
                  href={postData.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="Share post"
                >
                  <Share2 className="w-4 h-4" />
                </a>
              </div>

              <span className="text-[10px] text-slate-500 font-mono">
                Post ID: {currentEmbedPostId}
              </span>
            </div>

            {/* Likes Count */}
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {likeCount.toLocaleString()} likes
            </div>

            {/* Caption */}
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-white mr-1.5">@{postData.accountHandle}</span>
              {postData.caption}
            </div>

            {/* Timestamp & Direct Link */}
            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
              <span>{postData.postedDate}</span>
              <a
                href={postData.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00ADEF] hover:underline"
              >
                @deanzaforce_2011g_ecnl
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="font-condensed font-black text-lg text-slate-900 dark:text-white uppercase">
                Update Instagram Post Embed
              </h4>
              <button onClick={() => setIsEditing(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 mt-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Instagram Post URL or Link</label>
                <input
                  type="url"
                  value={editPostUrl}
                  onChange={(e) => setEditPostUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                  placeholder="https://www.instagram.com/p/..."
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Paste the full link to the team's latest post or reel.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Post Shortcode / ID (Optional)</label>
                <input
                  type="text"
                  value={editEmbedPostId}
                  onChange={(e) => setEditEmbedPostId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                  placeholder="e.g. DB-o1yBSe0n"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Fallback Photo URL (For Custom Card)</label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Post Caption</label>
                <textarea
                  rows={3}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-slate-900 dark:text-white font-bold"
                >
                  Save Embed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
