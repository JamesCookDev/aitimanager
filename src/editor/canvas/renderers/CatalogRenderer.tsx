import { useState, useMemo } from 'react';
import { Search, Tag } from 'lucide-react';

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  badge?: string;
  badgeColor?: string;
}

interface Props {
  title?: string;
  titleColor?: string;
  titleSize?: number;
  bgColor?: string;
  borderRadius?: number;
  items?: CatalogItem[];
  columns?: number;
  gap?: number;
  cardBgColor?: string;
  cardBorderRadius?: number;
  accentColor?: string;
  showPrice?: boolean;
  showCategory?: boolean;
  showSearch?: boolean;
  showCategoryFilter?: boolean;
  imageAspect?: string;
  priceColor?: string;
  nameSize?: number;
  priceSize?: number;
}

export function CatalogRenderer(props: Props) {
  const {
    title = 'Catálogo',
    titleColor = '#ffffff',
    titleSize = 24,
    bgColor = 'rgba(0,0,0,0.5)',
    borderRadius = 16,
    items = [],
    columns = 2,
    gap = 12,
    cardBgColor = 'rgba(255,255,255,0.08)',
    cardBorderRadius = 12,
    accentColor = '#6366f1',
    showPrice = true,
    showCategory = true,
    showSearch = false,
    showCategoryFilter = false,
    imageAspect = '4/3',
    priceColor = '#22c55e',
    nameSize = 14,
    priceSize = 16,
  } = props;

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category).filter(Boolean));
    return Array.from(cats);
  }, [items]);

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    if (activeCategory) {
      result = result.filter(i => i.category === activeCategory);
    }
    return result;
  }, [items, search, activeCategory]);

  return (
    <div className="w-full h-full overflow-auto flex flex-col" style={{ background: bgColor, borderRadius, padding: 16 }}>
      {/* Title */}
      <h2 className="font-bold mb-3 shrink-0" style={{ color: titleColor, fontSize: titleSize }}>{title}</h2>

      {/* Search */}
      {showSearch && (
        <div className="relative mb-3 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full h-9 pl-9 pr-3 rounded-lg text-xs text-white bg-white/10 border border-white/10 outline-none placeholder:text-white/30"
          />
        </div>
      )}

      {/* Category filter */}
      {showCategoryFilter && categories.length > 0 && (
        <div className="flex gap-2 mb-3 shrink-0 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-3 py-1 rounded-full text-[11px] font-medium shrink-0 transition-colors"
            style={{
              background: !activeCategory ? accentColor : 'rgba(255,255,255,0.1)',
              color: '#fff',
            }}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className="px-3 py-1 rounded-full text-[11px] font-medium shrink-0 transition-colors"
              style={{
                background: activeCategory === cat ? accentColor : 'rgba(255,255,255,0.1)',
                color: '#fff',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products grid */}
      <div
        className="flex-1 overflow-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
        }}
      >
        {filtered.map((item, i) => (
          <div
            key={item.id}
            className="overflow-hidden flex flex-col relative group"
            style={{
              background: cardBgColor,
              borderRadius: cardBorderRadius,
              animation: `fadeIn 0.3s ease-out ${i * 60}ms both`,
            }}
          >
            {/* Badge */}
            {item.badge && (
              <div
                className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ background: item.badgeColor || accentColor }}
              >
                {item.badge}
              </div>
            )}

            {/* Image */}
            {item.image ? (
              <div style={{ aspectRatio: imageAspect }} className="w-full overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                style={{ aspectRatio: imageAspect }}
                className="w-full flex items-center justify-center bg-white/5"
              >
                <Tag className="w-8 h-8 text-white/20" />
              </div>
            )}

            {/* Info */}
            <div className="p-3 flex flex-col flex-1">
              <h3 className="font-semibold text-white leading-tight" style={{ fontSize: nameSize }}>
                {item.name}
              </h3>
              {item.description && (
                <p className="text-white/50 text-[11px] mt-1 line-clamp-2">{item.description}</p>
              )}
              {showCategory && item.category && (
                <span className="text-[10px] mt-1 text-white/40">{item.category}</span>
              )}
              <div className="flex-1" />
              {showPrice && item.price && (
                <p className="font-bold mt-2" style={{ color: priceColor, fontSize: priceSize }}>
                  {item.price}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-white/40 text-xs text-center py-8">Nenhum produto encontrado</p>
      )}
    </div>
  );
}
