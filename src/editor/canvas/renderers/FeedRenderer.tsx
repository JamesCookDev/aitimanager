import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Rss, MapPin, Phone, Clock, Globe, Star, X, Tag, Search, ArrowRight } from 'lucide-react';
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
  const showSearch = props.showSearch !== false;
  const cardBg = props.cardBgColor || 'rgba(255,255,255,0.07)';
  const textColor = props.textColor || '#ffffff';
  const accentColor = props.accentColor || '#ef4444';
  const borderRadius = props.borderRadius ?? 16;
  const gap = props.gap ?? 12;
  const cardRadius = props.cardBorderRadius ?? 14;

  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }, [posts, searchQuery]);

  if (posts.length === 0) {
    return <Placeholder icon={Rss} label="Adicione lojas ao feed" gradient="bg-gradient-to-br from-pink-900/80 to-orange-900/80" />;
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none relative" style={{ borderRadius, background: props.bgColor || 'transparent' }}>
      {showSearch && (
        <div className="shrink-0 px-3 pt-3 pb-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
            <Search className="w-4 h-4 shrink-0 opacity-50" style={{ color: textColor }} />
            <input type="text" placeholder="Buscar lojas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full placeholder:opacity-40" style={{ color: textColor }} />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="shrink-0 opacity-50 hover:opacity-100"><X className="w-3.5 h-3.5" style={{ color: textColor }} /></button>
            )}
          </div>
          {searchQuery && <p className="text-[10px] opacity-40 mt-1 px-1" style={{ color: textColor }}>{filteredPosts.length} resultado{filteredPosts.length !== 1 ? 's' : ''}</p>}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className={layout === 'horizontal' ? 'flex h-full overflow-x-auto snap-x snap-mandatory' : 'flex flex-col'} style={{ gap, padding: gap / 2 }}>
          {filteredPosts.map((post) => (
            <StoreCard key={post.id} post={post} layout={layout} cardBg={cardBg} textColor={textColor} accentColor={accentColor} cardRadius={cardRadius} onSelect={() => setSelectedPost(post)} />
          ))}
          {filteredPosts.length === 0 && searchQuery && (
            <div className="flex-1 flex items-center justify-center py-12">
              <p className="text-xs opacity-40" style={{ color: textColor }}>Nenhuma loja encontrada</p>
            </div>
          )}
        </div>
      </div>

      {selectedPost && (
        <StoreDetailOverlay post={selectedPost} cardBg={cardBg} textColor={textColor} accentColor={accentColor} cardRadius={cardRadius} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}

/* ───── Store Card ───── */
function StoreCard({ post, layout, cardBg, textColor, accentColor, cardRadius, onSelect }: {
  post: FeedPost; layout: string; cardBg: string; textColor: string; accentColor: string; cardRadius: number; onSelect: () => void;
}) {
  const mainImage = post.images?.[0] || post.image;
  const stars = post.rating ?? 0;

  return (
    <div
      className={`${layout === 'horizontal' ? 'shrink-0 snap-center h-full flex flex-col' : 'flex flex-col'} cursor-pointer transition-all duration-200 active:scale-[0.97] hover:brightness-110`}
      style={{ background: cardBg, borderRadius: cardRadius, overflow: 'hidden', width: layout === 'horizontal' ? '85%' : '100%', minWidth: layout === 'horizontal' ? '85%' : undefined }}
      onClick={onSelect}
    >
      {/* Big store image */}
      <div className="relative w-full shrink-0" style={{ aspectRatio: '16/10' }}>
        {mainImage ? (
          <img src={mainImage} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <Rss className="w-8 h-8 opacity-20" style={{ color: textColor }} />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${cardBg} 0%, transparent 50%)` }} />

        {/* Category / Badge overlays */}
        {(post.category || post.badge) && (
          <div className="absolute top-2.5 left-2.5 z-10 flex gap-1.5">
            {post.category && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider" style={{ background: accentColor, color: '#fff' }}>{post.category}</span>}
            {post.badge && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(4px)' }}>{post.badge}</span>}
          </div>
        )}

        {/* Avatar logo floating */}
        {post.avatar && (
          <div className="absolute bottom-0 left-3 translate-y-1/2 z-10 w-11 h-11 rounded-xl overflow-hidden border-2 shadow-lg" style={{ borderColor: cardBg, background: cardBg }}>
            <img src={post.avatar} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Store info */}
      <div className="flex-1 px-3 pb-3" style={{ paddingTop: post.avatar ? 20 : 8 }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-bold leading-tight truncate" style={{ color: textColor }}>{post.title || 'Loja sem nome'}</h3>
            {post.author && <p className="text-[10px] opacity-50 mt-0.5" style={{ color: textColor }}>{post.author}</p>}
          </div>
          {stars > 0 && (
            <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
              <Star className="w-3 h-3" style={{ color: '#facc15', fill: '#facc15' }} />
              <span className="text-[10px] font-semibold" style={{ color: textColor }}>{stars}</span>
            </div>
          )}
        </div>

        {post.description && <p className="text-[10px] opacity-60 mt-1.5 line-clamp-2 leading-relaxed" style={{ color: textColor }}>{post.description}</p>}

        {/* Quick info row */}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {post.address && (
            <span className="text-[9px] opacity-50 flex items-center gap-1" style={{ color: textColor }}>
              <MapPin className="w-2.5 h-2.5 shrink-0" style={{ color: accentColor }} />{post.address.length > 30 ? post.address.slice(0, 30) + '…' : post.address}
            </span>
          )}
          {post.hours && (
            <span className="text-[9px] opacity-50 flex items-center gap-1" style={{ color: textColor }}>
              <Clock className="w-2.5 h-2.5 shrink-0" style={{ color: accentColor }} />{post.hours}
            </span>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: textColor, opacity: 0.7 }}>{tag}</span>
            ))}
            {post.tags.length > 3 && <span className="text-[8px] opacity-40 self-center" style={{ color: textColor }}>+{post.tags.length - 3}</span>}
          </div>
        )}

        {/* CTA */}
        {post.ctaLabel && (
          <button className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition-all active:scale-95"
            style={{ background: accentColor, color: '#fff' }} onClick={(e) => e.stopPropagation()}>
            {post.ctaLabel} <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ───── Store Detail Overlay ───── */
function StoreDetailOverlay({ post, cardBg, textColor, accentColor, cardRadius, onClose }: {
  post: FeedPost; cardBg: string; textColor: string; accentColor: string; cardRadius: number; onClose: () => void;
}) {
  const allImages = post.images?.length ? post.images : post.image ? [post.image] : [];
  const [imgIdx, setImgIdx] = useState(0);
  const stars = post.rating ?? 0;

  return (
    <div className="absolute inset-0 z-50 flex flex-col overflow-hidden animate-in fade-in duration-200"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div className="absolute inset-2 flex flex-col overflow-hidden"
        style={{ background: cardBg, borderRadius: cardRadius + 4, boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}>

        <button onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <X className="w-4 h-4 text-white" />
        </button>

        {allImages.length > 0 && (
          <div className="relative w-full shrink-0" style={{ height: '40%', minHeight: 140 }}>
            {allImages.map((src, i) => (
              <img key={i} src={src} alt="" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: i === imgIdx ? 1 : 0 }} />
            ))}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${cardBg} 0%, transparent 60%)` }} />
            {allImages.length > 1 && (
              <>
                <button onClick={() => setImgIdx(p => (p - 1 + allImages.length) % allImages.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center z-10"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button onClick={() => setImgIdx(p => (p + 1) % allImages.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center z-10"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {allImages.map((_, i) => (
                    <div key={i} className="rounded-full transition-all cursor-pointer" onClick={() => setImgIdx(i)}
                      style={{ width: i === imgIdx ? 16 : 6, height: 6, background: i === imgIdx ? accentColor : 'rgba(255,255,255,0.4)' }} />
                  ))}
                </div>
              </>
            )}
            {(post.category || post.badge) && (
              <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                {post.category && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: accentColor, color: '#fff' }}>{post.category}</span>}
                {post.badge && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(255,255,255,0.15)', color: textColor, backdropFilter: 'blur(4px)' }}>{post.badge}</span>}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-4 -mt-2 space-y-3">
          <div className="flex items-start gap-3">
            {post.avatar && (
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 shadow-lg" style={{ borderColor: accentColor }}>
                <img src={post.avatar} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold leading-tight" style={{ color: textColor }}>{post.title || 'Loja'}</h3>
              {post.author && <p className="text-[11px] opacity-60 mt-0.5" style={{ color: textColor }}>{post.author}</p>}
              {stars > 0 && (
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3" style={{ color: i < stars ? '#facc15' : 'rgba(255,255,255,0.2)', fill: i < stars ? '#facc15' : 'none' }} />
                  ))}
                  <span className="text-[10px] ml-1 opacity-50" style={{ color: textColor }}>{stars}/5</span>
                </div>
              )}
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium"
                  style={{ background: 'rgba(255,255,255,0.08)', color: textColor }}>
                  <Tag className="w-2.5 h-2.5" style={{ color: accentColor }} />{tag}
                </span>
              ))}
            </div>
          )}

          {(post.detailDescription || post.description) && (
            <p className="text-[11px] leading-relaxed opacity-80" style={{ color: textColor }}>{post.detailDescription || post.description}</p>
          )}

          <div className="space-y-2">
            {post.address && <InfoRow icon={<MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />} text={post.address} textColor={textColor} />}
            {post.phone && <InfoRow icon={<Phone className="w-3.5 h-3.5" style={{ color: accentColor }} />} text={post.phone} textColor={textColor} />}
            {post.hours && <InfoRow icon={<Clock className="w-3.5 h-3.5" style={{ color: accentColor }} />} text={post.hours} textColor={textColor} />}
            {post.website && <InfoRow icon={<Globe className="w-3.5 h-3.5" style={{ color: accentColor }} />} text={post.website} textColor={textColor} />}
          </div>

          {post.ctaLabel && (
            <button className="w-full mt-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{ background: accentColor, color: '#fff' }}>{post.ctaLabel}</button>
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
