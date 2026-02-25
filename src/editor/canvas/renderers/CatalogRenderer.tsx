import { useState, useMemo } from 'react';
import { Search, Tag, ChevronRight, Star, MapPin } from 'lucide-react';
import { usePageVariables } from '../PageVariablesContext';

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  badge?: string;
  badgeColor?: string;
  available?: boolean;
  rating?: number;
  location?: string;
  sku?: string;
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
  showUnavailable?: boolean;
  showRating?: boolean;
  imageAspect?: string;
  priceColor?: string;
  nameSize?: number;
  priceSize?: number;
  unavailableText?: string;
  /** Action type */
  itemAction?: string;
  /** Navigate to this page when clicking an item */
  itemNavigateTarget?: string;
  itemNavigateTransition?: string;
  /** WhatsApp */
  whatsappNumber?: string;
  whatsappOrderTemplate?: string;
  /** Webhook */
  orderWebhookUrl?: string;
  orderSuccessMsg?: string;
  /** Variable prefix */
  variablePrefix?: string;
  /** Target variable for direct linking */
  targetVariable?: string;
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
    showUnavailable = true,
    showRating = false,
    imageAspect = '4/3',
    priceColor = '#22c55e',
    nameSize = 14,
    priceSize = 16,
    unavailableText = 'Indisponível',
    itemAction = 'none',
    itemNavigateTarget,
    itemNavigateTransition = 'fade',
    whatsappNumber,
    whatsappOrderTemplate,
    orderWebhookUrl,
    variablePrefix = 'produto',
    targetVariable,
  } = props;

  const { setVariables, navigateToPage } = usePageVariables();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category).filter(Boolean));
    return Array.from(cats);
  }, [items]);

  const filtered = useMemo(() => {
    let result = items;
    if (!showUnavailable) {
      result = result.filter(i => i.available !== false);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
    }
    if (activeCategory) {
      result = result.filter(i => i.category === activeCategory);
    }
    return result;
  }, [items, search, activeCategory, showUnavailable]);

  const handleItemClick = (item: CatalogItem) => {
    if (item.available === false) return;
    setSelectedId(item.id);

    // Set variables with item data using configurable prefix
    const prefix = variablePrefix;
    const vars: Record<string, string> = {
      [`${prefix}_nome`]: item.name,
      [`${prefix}_descricao`]: item.description || '',
      [`${prefix}_preco`]: item.price || '',
      [`${prefix}_imagem`]: item.image || '',
      [`${prefix}_categoria`]: item.category || '',
      [`${prefix}_badge`]: item.badge || '',
      [`${prefix}_id`]: item.id,
      [`${prefix}_sku`]: item.sku || '',
      // Keep legacy variables for backward compat
      item_name: item.name,
      item_description: item.description || '',
      item_price: item.price || '',
      item_image: item.image || '',
      item_category: item.category || '',
      item_badge: item.badge || '',
    };

    if (targetVariable) {
      vars[targetVariable] = item.name;
    }

    setVariables(vars);

    // Navigate action
    if ((itemAction === 'navigate' || itemNavigateTarget) && navigateToPage) {
      const target = itemNavigateTarget;
      if (target) {
        setTimeout(() => {
          navigateToPage(target, itemNavigateTransition as any, vars);
        }, 200);
        return;
      }
    }

    // WhatsApp action
    if (itemAction === 'whatsapp' && whatsappNumber) {
      let msg = whatsappOrderTemplate || `Olá! Gostaria de pedir: ${item.name} (${item.price})`;
      msg = msg.replace(/\{\{item_name\}\}/g, item.name)
        .replace(/\{\{item_price\}\}/g, item.price || '')
        .replace(/\{\{item_category\}\}/g, item.category || '')
        .replace(/\{\{item_description\}\}/g, item.description || '');
      const phone = whatsappNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    // Webhook action
    if (itemAction === 'webhook' && orderWebhookUrl) {
      fetch(orderWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: { name: item.name, description: item.description, price: item.price, category: item.category, id: item.id } }),
      }).catch(console.error);
    }

    // Prompt action
    if (itemAction === 'prompt' && typeof (window as any).__totemSendMessage === 'function') {
      (window as any).__totemSendMessage(`Quero saber sobre o produto: ${item.name}`);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className="w-3 h-3" style={{
          color: n <= Math.round(rating) ? '#facc15' : 'rgba(255,255,255,0.15)',
          fill: n <= Math.round(rating) ? '#facc15' : 'none',
        }} />
      ))}
    </div>
  );

  return (
    <div className="w-full h-full overflow-auto flex flex-col" style={{
      background: `linear-gradient(160deg, ${bgColor}, rgba(0,0,0,0.55))`,
      borderRadius,
      padding: 16,
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h2 className="font-bold" style={{ color: titleColor, fontSize: titleSize }}>{title}</h2>
        {filtered.length > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
            background: `${accentColor}18`,
            color: accentColor,
            border: `1px solid ${accentColor}25`,
          }}>
            {filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'}
          </span>
        )}
      </div>

      {showSearch && (
        <div className="relative mb-3 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full h-10 pl-9 pr-3 rounded-xl text-xs outline-none"
            style={{
              color: titleColor,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>
      )}

      {showCategoryFilter && categories.length > 0 && (
        <div className="flex gap-2 mb-3 shrink-0 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium shrink-0 transition-all"
            style={{
              background: !activeCategory ? accentColor : 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: `1px solid ${!activeCategory ? accentColor : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium shrink-0 transition-all"
              style={{
                background: activeCategory === cat ? accentColor : 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: `1px solid ${activeCategory === cat ? accentColor : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto" style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
        {filtered.map((item, i) => {
          const isSelected = selectedId === item.id;
          const isUnavailable = item.available === false;
          const hasAction = itemAction !== 'none' || itemNavigateTarget;

          return (
            <button
              key={item.id}
              className={`overflow-hidden flex flex-col relative text-left transition-all ${hasAction ? 'active:scale-[0.97]' : ''}`}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${cardBgColor}, ${accentColor}12)`
                  : cardBgColor,
                borderRadius: cardBorderRadius,
                border: isSelected
                  ? `1.5px solid ${accentColor}50`
                  : '1px solid rgba(255,255,255,0.06)',
                opacity: isUnavailable ? 0.45 : 1,
                cursor: isUnavailable ? 'not-allowed' : hasAction ? 'pointer' : 'default',
                animation: `fadeIn 0.3s ease-out ${i * 60}ms both`,
              }}
              onClick={() => handleItemClick(item)}
              disabled={isUnavailable}
            >
              {/* Badge */}
              {item.badge && (
                <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: item.badgeColor || accentColor }}>
                  {item.badge}
                </div>
              )}

              {/* Unavailable overlay */}
              {isUnavailable && (
                <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', borderRadius: cardBorderRadius }}>
                  <span className="text-xs font-bold text-white/70 px-3 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.4)' }}>
                    {unavailableText}
                  </span>
                </div>
              )}

              {/* Image */}
              {item.image ? (
                <div style={{ aspectRatio: imageAspect }} className="w-full overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div style={{ aspectRatio: imageAspect, background: 'rgba(255,255,255,0.03)' }} className="w-full flex items-center justify-center">
                  <Tag className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.15)' }} />
                </div>
              )}

              {/* Content */}
              <div className="p-3 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-semibold leading-tight" style={{ color: titleColor, fontSize: nameSize }}>{item.name}</h3>
                  {hasAction && !isUnavailable && (
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  )}
                </div>
                {item.description && <p className="text-[11px] mt-1 line-clamp-2 leading-tight" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.description}</p>}
                {showCategory && item.category && (
                  <span className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.category}</span>
                )}
                {showRating && item.rating && <div className="mt-1">{renderStars(item.rating)}</div>}
                {item.location && (
                  <span className="flex items-center gap-0.5 text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <MapPin className="w-2.5 h-2.5" /> {item.location}
                  </span>
                )}
                <div className="flex-1" />
                {showPrice && item.price && (
                  <p className="font-bold mt-2" style={{ color: priceColor, fontSize: priceSize }}>{item.price}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <Search className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
}
