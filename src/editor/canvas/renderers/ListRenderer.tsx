import { useState } from 'react';
import { ChevronRight, Search, Star, Tag, Clock, MapPin } from 'lucide-react';
import { usePageVariables } from '../PageVariablesContext';

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  price?: string;
  icon?: string;
  image?: string;
  badge?: string;
  badgeColor?: string;
  available?: boolean;
  rating?: number;
  tags?: string;
  location?: string;
  duration?: string;
  /** Variable name prefix for this item when selected */
  variablePrefix?: string;
}

interface Props {
  listTitle?: string;
  items?: ListItem[];
  titleColor?: string;
  subtitleColor?: string;
  priceColor?: string;
  dividerColor?: string;
  bgColor?: string;
  borderRadius?: number;
  titleSize?: number;
  showDivider?: boolean;
  showIcon?: boolean;
  showPrice?: boolean;
  showAvailability?: boolean;
  showSearch?: boolean;
  showDescription?: boolean;
  showBadges?: boolean;
  showRating?: boolean;
  itemLayout?: 'compact' | 'card' | 'detailed';
  accentColor?: string;
  itemAction?: string;
  whatsappNumber?: string;
  whatsappTemplate?: string;
  listWebhookUrl?: string;
  /** Navigate to page on item click */
  navigateOnSelect?: string;
  navigateTransition?: string;
  /** Prefix for variables set when an item is selected */
  variablePrefix?: string;
  /** Target element variable (links to form/text on another page) */
  targetVariable?: string;
}

export function ListRenderer(props: Props) {
  const {
    listTitle,
    items: rawItems = [
      { id: '1', title: 'Item 1', subtitle: 'Descrição do item', price: 'R$ 29,90', icon: '🍔', badge: 'Popular', rating: 4.5 },
      { id: '2', title: 'Item 2', subtitle: 'Descrição do item', price: 'R$ 19,90', icon: '🍟', badge: 'Novo' },
      { id: '3', title: 'Item 3', subtitle: 'Descrição do item', price: 'R$ 14,90', icon: '🥤' },
    ],
    titleColor = '#ffffff',
    subtitleColor = 'rgba(255,255,255,0.6)',
    priceColor = '#6366f1',
    dividerColor = 'rgba(255,255,255,0.06)',
    bgColor = 'rgba(0,0,0,0.4)',
    borderRadius = 16,
    titleSize = 16,
    showDivider = true,
    showIcon = true,
    showPrice = true,
    showAvailability = false,
    showSearch = false,
    showDescription = false,
    showBadges = true,
    showRating = false,
    itemLayout = 'detailed',
    accentColor = '#6366f1',
    itemAction = 'none',
    whatsappNumber,
    whatsappTemplate,
    listWebhookUrl,
    navigateOnSelect,
    navigateTransition = 'slide-left',
    variablePrefix = 'item',
    targetVariable,
  } = props;

  const { setVariables, navigateToPage } = usePageVariables();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = rawItems.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return item.title.toLowerCase().includes(term) ||
      item.subtitle?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.tags?.toLowerCase().includes(term);
  });

  const handleItemClick = (item: ListItem) => {
    setSelectedId(item.id);

    // Set variables with item data
    const prefix = item.variablePrefix || variablePrefix;
    const vars: Record<string, string> = {
      [`${prefix}_titulo`]: item.title,
      [`${prefix}_subtitulo`]: item.subtitle || '',
      [`${prefix}_descricao`]: item.description || '',
      [`${prefix}_preco`]: item.price || '',
      [`${prefix}_icone`]: item.icon || '',
      [`${prefix}_badge`]: item.badge || '',
      [`${prefix}_id`]: item.id,
    };

    // If a target variable is specified, also set it directly
    if (targetVariable) {
      vars[targetVariable] = item.title;
    }

    setVariables(vars);

    // Navigate to linked page
    if (navigateOnSelect && navigateToPage) {
      setTimeout(() => {
        navigateToPage(navigateOnSelect, navigateTransition as any, vars);
      }, 200);
      return;
    }

    // Other actions
    if (itemAction === 'whatsapp' && whatsappNumber) {
      let msg = whatsappTemplate || `Quero pedir: ${item.title} (${item.price})`;
      msg = msg.replace(/\{\{titulo\}\}/g, item.title)
        .replace(/\{\{preco\}\}/g, item.price || '')
        .replace(/\{\{subtitulo\}\}/g, item.subtitle || '');
      const phone = whatsappNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    if (itemAction === 'webhook' && listWebhookUrl) {
      fetch(listWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: { title: item.title, subtitle: item.subtitle, price: item.price, id: item.id } }),
      }).catch(console.error);
    }

    if (itemAction === 'prompt' && typeof (window as any).__totemSendMessage === 'function') {
      (window as any).__totemSendMessage(`Quero saber sobre: ${item.title}`);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <Star
            key={n}
            className="w-3 h-3"
            style={{
              color: n <= Math.round(rating) ? '#facc15' : 'rgba(255,255,255,0.15)',
              fill: n <= Math.round(rating) ? '#facc15' : 'none',
            }}
          />
        ))}
        <span className="text-[10px] ml-1" style={{ color: subtitleColor }}>{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div
      className="w-full h-full overflow-auto flex flex-col"
      style={{
        background: `linear-gradient(160deg, ${bgColor}, rgba(0,0,0,0.55))`,
        borderRadius,
        padding: 16,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      {listTitle && (
        <div className="flex items-center justify-between mb-3 shrink-0">
          <p style={{ color: titleColor, fontSize: titleSize + 6, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {listTitle}
          </p>
          {items.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
              background: `${accentColor}18`,
              color: accentColor,
              border: `1px solid ${accentColor}25`,
            }}>
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </span>
          )}
        </div>
      )}

      {/* Search */}
      {showSearch && (
        <div className="relative mb-3 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: subtitleColor }} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl text-sm outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: titleColor,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>
      )}

      {/* Items */}
      <div className={`flex-1 overflow-auto ${itemLayout === 'card' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-1.5'}`}>
        {items.map((item, i) => {
          const isSelected = selectedId === item.id;
          const isUnavailable = showAvailability && item.available === false;

          if (itemLayout === 'card') {
            return (
              <button
                key={item.id}
                onClick={() => !isUnavailable && handleItemClick(item)}
                className="text-left transition-all active:scale-[0.97]"
                style={{
                  borderRadius: 14,
                  background: isSelected
                    ? `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`
                    : 'rgba(255,255,255,0.04)',
                  border: isSelected
                    ? `1.5px solid ${accentColor}50`
                    : '1px solid rgba(255,255,255,0.06)',
                  padding: 12,
                  opacity: isUnavailable ? 0.4 : 1,
                  cursor: isUnavailable ? 'not-allowed' : 'pointer',
                }}
              >
                {showIcon && (
                  item.image
                    ? <img src={item.image} alt="" className="w-full aspect-square rounded-xl object-cover mb-2" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
                    : <div className="w-full aspect-square rounded-xl flex items-center justify-center mb-2" style={{ background: 'rgba(255,255,255,0.06)', fontSize: 36 }}>{item.icon || '📌'}</div>
                )}
                {showBadges && item.badge && (
                  <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mb-1.5" style={{
                    background: `${item.badgeColor || accentColor}20`,
                    color: item.badgeColor || accentColor,
                    border: `1px solid ${item.badgeColor || accentColor}30`,
                  }}>
                    {item.badge}
                  </span>
                )}
                <p className="font-semibold truncate" style={{ color: titleColor, fontSize: titleSize - 1 }}>{item.title}</p>
                {item.subtitle && <p className="truncate mt-0.5" style={{ color: subtitleColor, fontSize: titleSize - 4 }}>{item.subtitle}</p>}
                {showPrice && item.price && (
                  <p className="font-bold mt-1.5" style={{ color: priceColor, fontSize: titleSize }}>{item.price}</p>
                )}
                {showRating && item.rating && <div className="mt-1">{renderStars(item.rating)}</div>}
              </button>
            );
          }

          // Detailed / Compact layout
          return (
            <div key={item.id}>
              <button
                onClick={() => !isUnavailable && handleItemClick(item)}
                className="w-full text-left flex items-stretch gap-3 transition-all active:scale-[0.98]"
                style={{
                  borderRadius: 14,
                  padding: itemLayout === 'compact' ? '8px 10px' : '10px 12px',
                  background: isSelected
                    ? `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`
                    : 'rgba(255,255,255,0.03)',
                  border: isSelected
                    ? `1.5px solid ${accentColor}40`
                    : '1px solid rgba(255,255,255,0.04)',
                  opacity: isUnavailable ? 0.4 : 1,
                  cursor: isUnavailable ? 'not-allowed' : 'pointer',
                }}
              >
                {/* Icon / Image */}
                {showIcon && (
                  item.image
                    ? <img
                        src={item.image}
                        alt=""
                        className="rounded-xl object-cover shrink-0"
                        style={{
                          width: itemLayout === 'compact' ? 44 : 60,
                          height: itemLayout === 'compact' ? 44 : 60,
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      />
                    : <div
                        className="rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          width: itemLayout === 'compact' ? 44 : 60,
                          height: itemLayout === 'compact' ? 44 : 60,
                          background: `linear-gradient(135deg, ${accentColor}12, rgba(255,255,255,0.04))`,
                          border: `1px solid ${accentColor}15`,
                          fontSize: itemLayout === 'compact' ? 22 : 28,
                        }}
                      >
                        {item.icon || '📌'}
                      </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate" style={{ color: titleColor, fontSize: titleSize }}>{item.title}</p>
                    {showBadges && item.badge && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap" style={{
                        background: `${item.badgeColor || accentColor}20`,
                        color: item.badgeColor || accentColor,
                        border: `1px solid ${item.badgeColor || accentColor}30`,
                      }}>
                        {item.badge}
                      </span>
                    )}
                    {isUnavailable && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                        Indisponível
                      </span>
                    )}
                  </div>

                  {item.subtitle && (
                    <p className="truncate mt-0.5" style={{ color: subtitleColor, fontSize: titleSize - 3 }}>{item.subtitle}</p>
                  )}

                  {showDescription && item.description && (
                    <p className="mt-1 line-clamp-2 leading-tight" style={{ color: `${subtitleColor}`, fontSize: titleSize - 4 }}>
                      {item.description}
                    </p>
                  )}

                  {/* Meta row */}
                  {(showRating || item.tags || item.location || item.duration) && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {showRating && item.rating && renderStars(item.rating)}
                      {item.location && (
                        <span className="flex items-center gap-0.5 text-[9px]" style={{ color: subtitleColor }}>
                          <MapPin className="w-2.5 h-2.5" /> {item.location}
                        </span>
                      )}
                      {item.duration && (
                        <span className="flex items-center gap-0.5 text-[9px]" style={{ color: subtitleColor }}>
                          <Clock className="w-2.5 h-2.5" /> {item.duration}
                        </span>
                      )}
                      {item.tags && (
                        <span className="flex items-center gap-0.5 text-[9px]" style={{ color: subtitleColor }}>
                          <Tag className="w-2.5 h-2.5" /> {item.tags}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right side: price + action indicator */}
                <div className="flex flex-col items-end justify-center shrink-0 gap-1">
                  {showPrice && item.price && (
                    <span className="font-bold px-2.5 py-1 rounded-lg" style={{
                      color: priceColor,
                      fontSize: titleSize - 1,
                      background: `${priceColor}10`,
                      border: `1px solid ${priceColor}20`,
                    }}>
                      {item.price}
                    </span>
                  )}
                  {(navigateOnSelect || itemAction !== 'none') && (
                    <ChevronRight className="w-4 h-4" style={{ color: `${subtitleColor}` }} />
                  )}
                </div>
              </button>

              {showDivider && i < items.length - 1 && (
                <div style={{ height: 1, background: dividerColor, margin: '0 16px' }} />
              )}
            </div>
          );
        })}

        {items.length === 0 && searchTerm && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Search className="w-6 h-6" style={{ color: subtitleColor }} />
            <p className="text-sm" style={{ color: subtitleColor }}>Nenhum item encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
