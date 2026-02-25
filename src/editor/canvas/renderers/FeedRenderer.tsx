import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight, Rss, MapPin, Phone, Clock, Globe, Star, X, Tag } from 'lucide-react';
import { Placeholder } from './Placeholder';

export interface FeedPost {
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
  // Store fields
  phone?: string;
  address?: string;
  hours?: string;
  website?: string;
  category?: string;
  tags?: string[];
  rating?: number;
  detailDescription?: string;
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

  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);

  if (posts.length === 0) {
    return <Placeholder icon={Rss} label="Adicione lojas ao feed" gradient="bg-gradient-to-br from-pink-900/80 to-orange-900/80" />;
  }

  return (
    <div
      className="w-full h-full overflow-auto select-none relative"
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
            onSelect={() => setSelectedPost(post)}
          />
        ))}
      </div>

      {/* Detail overlay */}
      {selectedPost && (
        <StoreDetailOverlay
          post={selectedPost}
          cardBg={cardBg}
          textColor={textColor}
          accentColor={accentColor}
          cardRadius={cardRadius}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}

/* ───── Store Detail Overlay ───── */
function StoreDetailOverlay({
  post,
  cardBg,
  textColor,
  accentColor,
  cardRadius,
  onClose,
}: {
  post: FeedPost;
  cardBg: string;
  textColor: string;
  accentColor: string;
  cardRadius: number;
  onClose: () => void;
}) {
  const allImages = post.images?.length ? post.images : post.image ? [post.image] : [];
  const [imgIdx, setImgIdx] = useState(0);
  const stars = post.rating ?? 0;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col overflow-hidden animate-in fade-in duration-200"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="absolute inset-2 flex flex-col overflow-hidden"
        style={{ background: cardBg, borderRadius: cardRadius + 4, boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Hero image gallery */}
        {allImages.length > 0 && (
          <div className="relative w-full shrink-0" style={{ height: '40%', minHeight: 140 }}>
            {allImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: i === imgIdx ? 1 : 0 }}
              />
            ))}
            {/* Gradient overlay */}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${cardBg} 0%, transparent 60%)` }} />

            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx(p => (p - 1 + allImages.length) % allImages.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center z-10"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setImgIdx(p => (p + 1) % allImages.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center z-10"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {allImages.map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all cursor-pointer"
                      onClick={() => setImgIdx(i)}
                      style={{
                        width: i === imgIdx ? 16 : 6,
                        height: 6,
                        background: i === imgIdx ? accentColor : 'rgba(255,255,255,0.4)',
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badge / category */}
            {(post.category || post.badge) && (
              <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                {post.category && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: accentColor, color: '#fff' }}
                  >
                    {post.category}
                  </span>
                )}
                {post.badge && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(255,255,255,0.15)', color: textColor, backdropFilter: 'blur(4px)' }}
                  >
                    {post.badge}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 -mt-2 space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            {post.avatar && (
              <div
                className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2"
                style={{ borderColor: accentColor }}
              >
                <img src={post.avatar} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold leading-tight" style={{ color: textColor }}>
                {post.title || post.author || 'Loja'}
              </h3>
              {post.author && post.title && (
                <p className="text-[11px] opacity-60 mt-0.5" style={{ color: textColor }}>{post.author}</p>
              )}
              {/* Rating */}
              {stars > 0 && (
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3"
                      style={{
                        color: i < stars ? '#facc15' : 'rgba(255,255,255,0.2)',
                        fill: i < stars ? '#facc15' : 'none',
                      }}
                    />
                  ))}
                  <span className="text-[10px] ml-1 opacity-50" style={{ color: textColor }}>{stars}/5</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium"
                  style={{ background: 'rgba(255,255,255,0.08)', color: textColor }}
                >
                  <Tag className="w-2.5 h-2.5" style={{ color: accentColor }} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {(post.detailDescription || post.description) && (
            <p className="text-[11px] leading-relaxed opacity-80" style={{ color: textColor }}>
              {post.detailDescription || post.description}
            </p>
          )}

          {/* Info cards */}
          <div className="space-y-2">
            {post.address && (
              <InfoRow icon={<MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />} text={post.address} textColor={textColor} />
            )}
            {post.phone && (
              <InfoRow icon={<Phone className="w-3.5 h-3.5" style={{ color: accentColor }} />} text={post.phone} textColor={textColor} />
            )}
            {post.hours && (
              <InfoRow icon={<Clock className="w-3.5 h-3.5" style={{ color: accentColor }} />} text={post.hours} textColor={textColor} />
            )}
            {post.website && (
              <InfoRow icon={<Globe className="w-3.5 h-3.5" style={{ color: accentColor }} />} text={post.website} textColor={textColor} />
            )}
          </div>

          {/* CTA */}
          {post.ctaLabel && (
            <button
              className="w-full mt-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{ background: accentColor, color: '#fff' }}
            >
              {post.ctaLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, text, textColor }: { icon: React.ReactNode; text: string; textColor: string }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5 px-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <span className="text-[11px] leading-snug" style={{ color: textColor }}>{text}</span>
    </div>
  );
}

/* ───── Feed Card ───── */
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
  onSelect,
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
  onSelect: () => void;
}) {
  const allImages = post.images?.length ? post.images : post.image ? [post.image] : [];
  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);

  return (
    <div
      className={`${layout === 'horizontal' ? 'shrink-0 snap-center h-full flex flex-col' : 'flex flex-col'} cursor-pointer transition-transform active:scale-[0.98]`}
      style={{
        background: cardBg,
        borderRadius: cardRadius,
        overflow: 'hidden',
        width: layout === 'horizontal' ? '85%' : '100%',
        minWidth: layout === 'horizontal' ? '85%' : undefined,
      }}
      onClick={onSelect}
    >
      {/* Header */}
      {showAuthor && (
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div
            className="w-8 h-8 rounded-full overflow-hidden shrink-0"
            style={{ background: `linear-gradient(135deg, ${accentColor}, #ec4899, #8b5cf6)`, padding: 2 }}
          >
            <div className="w-full h-full rounded-full overflow-hidden" style={{ background: cardBg }}>
              {post.avatar ? (
                <img src={post.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: textColor }}>
                  {(post.author || 'L')[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: textColor }}>{post.author || 'Loja'}</p>
            {post.category && <p className="text-[9px] opacity-60" style={{ color: textColor }}>{post.category}</p>}
          </div>
          {post.rating && post.rating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3" style={{ color: '#facc15', fill: '#facc15' }} />
              <span className="text-[10px] font-medium" style={{ color: textColor }}>{post.rating}</span>
            </div>
          )}
        </div>
      )}

      {/* Image */}
      {allImages.length > 0 && (
        <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
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
                onClick={(e) => { e.stopPropagation(); setImgIdx(p => (p - 1 + allImages.length) % allImages.length); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setImgIdx(p => (p + 1) % allImages.length); }}
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
        <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }} className="transition-transform active:scale-125">
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
            {post.title}
          </p>
        )}
        {post.description && (
          <p className="text-[11px] opacity-70 mt-0.5 line-clamp-2" style={{ color: textColor }}>
            {post.description}
          </p>
        )}
        {post.address && (
          <p className="text-[10px] opacity-50 mt-1 flex items-center gap-1" style={{ color: textColor }}>
            <MapPin className="w-3 h-3 inline shrink-0" /> {post.address}
          </p>
        )}
      </div>
    </div>
  );
}
