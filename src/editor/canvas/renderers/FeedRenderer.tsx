import { useState, useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight, Rss } from 'lucide-react';
import { Placeholder } from './Placeholder';

interface FeedPost {
  id: string;
  image: string;
  images?: string[];
  title: string;
  description: string;
  ctaLabel?: string;
  ctaUrl?: string;
  avatar?: string;
  author?: string;
  likes?: number;
  badge?: string;
}

export function FeedRenderer(props: any) {
  const posts: FeedPost[] = props.posts || [];
  const layout = props.layout || 'vertical';
  const showLikes = props.showLikes !== false;
  const showComments = props.showComments !== false;
  const showAuthor = props.showAuthor !== false;
  const cardBg = props.cardBgColor || 'rgba(0,0,0,0.6)';
  const textColor = props.textColor || '#ffffff';
  const accentColor = props.accentColor || '#ef4444';
  const borderRadius = props.borderRadius ?? 16;
  const gap = props.gap ?? 16;
  const cardRadius = props.cardBorderRadius ?? 12;

  if (posts.length === 0) {
    return <Placeholder icon={Rss} label="Adicione posts ao feed" gradient="bg-gradient-to-br from-pink-900/80 to-orange-900/80" />;
  }

  return (
    <div
      className="w-full h-full overflow-auto select-none"
      style={{ borderRadius, background: props.bgColor || 'transparent' }}
    >
      <div
        className={layout === 'horizontal' ? 'flex h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory' : 'flex flex-col overflow-y-auto'}
        style={{ gap, padding: gap / 2 }}
      >
        {posts.map((post) => (
          <FeedCard
            key={post.id}
            post={post}
            layout={layout}
            showLikes={showLikes}
            showComments={showComments}
            showAuthor={showAuthor}
            cardBg={cardBg}
            textColor={textColor}
            accentColor={accentColor}
            cardRadius={cardRadius}
          />
        ))}
      </div>
    </div>
  );
}

function FeedCard({
  post,
  layout,
  showLikes,
  showComments,
  showAuthor,
  cardBg,
  textColor,
  accentColor,
  cardRadius,
}: {
  post: FeedPost;
  layout: string;
  showLikes: boolean;
  showComments: boolean;
  showAuthor: boolean;
  cardBg: string;
  textColor: string;
  accentColor: string;
  cardRadius: number;
}) {
  const allImages = post.images?.length ? post.images : post.image ? [post.image] : [];
  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);

  return (
    <div
      className={layout === 'horizontal' ? 'shrink-0 snap-center h-full flex flex-col' : 'flex flex-col'}
      style={{
        background: cardBg,
        borderRadius: cardRadius,
        overflow: 'hidden',
        width: layout === 'horizontal' ? '85%' : '100%',
        minWidth: layout === 'horizontal' ? '85%' : undefined,
      }}
    >
      {/* Header */}
      {showAuthor && (
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div
            className="w-8 h-8 rounded-full overflow-hidden shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444, #ec4899, #8b5cf6)', padding: 2 }}
          >
            <div className="w-full h-full rounded-full overflow-hidden" style={{ background: cardBg }}>
              {post.avatar ? (
                <img src={post.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: textColor }}>
                  {(post.author || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: textColor }}>{post.author || 'Usuário'}</p>
            {post.badge && <p className="text-[9px] opacity-60" style={{ color: textColor }}>{post.badge}</p>}
          </div>
          <MoreHorizontal className="w-4 h-4 opacity-50 shrink-0" style={{ color: textColor }} />
        </div>
      )}

      {/* Image area with mini-carousel */}
      {allImages.length > 0 && (
        <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
          {allImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
              style={{ opacity: i === imgIdx ? 1 : 0 }}
            />
          ))}
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx(p => (p - 1 + allImages.length) % allImages.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-white" />
              </button>
              <button
                onClick={() => setImgIdx(p => (p + 1) % allImages.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              >
                <ChevronRight className="w-3.5 h-3.5 text-white" />
              </button>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                {allImages.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all"
                    style={{
                      width: i === imgIdx ? 14 : 5,
                      height: 5,
                      background: i === imgIdx ? accentColor : 'rgba(255,255,255,0.4)',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions bar */}
      <div className="flex items-center px-3 py-2 gap-3">
        <button onClick={() => setLiked(!liked)} className="transition-transform active:scale-125">
          <Heart
            className="w-5 h-5 transition-colors"
            style={{ color: liked ? accentColor : textColor, fill: liked ? accentColor : 'none' }}
          />
        </button>
        {showComments && <MessageCircle className="w-5 h-5" style={{ color: textColor }} />}
        <Send className="w-5 h-5" style={{ color: textColor }} />
        <div className="flex-1" />
        <Bookmark className="w-5 h-5" style={{ color: textColor }} />
      </div>

      {/* Likes */}
      {showLikes && (
        <p className="px-3 text-[11px] font-semibold" style={{ color: textColor }}>
          {(post.likes || 0) + (liked ? 1 : 0)} curtidas
        </p>
      )}

      {/* Text */}
      <div className="px-3 pb-3 pt-1 flex-1">
        {post.title && (
          <p className="text-xs font-bold" style={{ color: textColor }}>
            {showAuthor && <span className="mr-1">{post.author || 'Usuário'}</span>}
            {post.title}
          </p>
        )}
        {post.description && (
          <p className="text-[11px] opacity-70 mt-0.5 line-clamp-3" style={{ color: textColor }}>
            {post.description}
          </p>
        )}
        {post.ctaLabel && (
          <button
            className="mt-2 px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-95"
            style={{ background: accentColor, color: '#fff' }}
          >
            {post.ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
