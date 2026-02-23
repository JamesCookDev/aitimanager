import { useState, useMemo } from 'react';
import { Store } from 'lucide-react';

export function StoreRenderer(props: any) {
  const stores = props.stores || [];
  const title = props.title || 'Lojas';
  const titleColor = props.titleColor || '#ffffff';
  const titleSize = props.titleSize || 28;
  const bgColor = props.bgColor || 'rgba(0,0,0,0.6)';
  const borderRadius = props.borderRadius || 16;
  const columns = props.columns || 1;
  const gap = props.gap || 12;
  const cardBgColor = props.cardBgColor || 'rgba(255,255,255,0.08)';
  const cardBorderRadius = props.cardBorderRadius || 12;
  const accentColor = props.accentColor || '#6366f1';
  const showCategory = props.showCategory !== false;
  const showHours = props.showHours !== false;
  const showPhone = props.showPhone !== false;
  const showFloor = props.showFloor !== false;
  const showFilter = props.showCategoryFilter !== false;
  const showSearch = props.showSearch !== false;

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = stores.map((s: any) => s.category).filter(Boolean);
    return [...new Set(cats)] as string[];
  }, [stores]);

  const filtered = useMemo(() => {
    let result = stores;
    if (activeCategory) result = result.filter((s: any) => s.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((s: any) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [stores, activeCategory, search]);

  if (stores.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: bgColor, borderRadius }}>
        <Store className="w-10 h-10 text-white/30" />
        <span className="text-white/40 text-xs">Adicione lojas ao diretório</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none" style={{ background: bgColor, borderRadius, padding: 16 }}>
      <div className="flex-shrink-0 mb-2 flex items-center gap-2">
        <div className="w-1 h-6 rounded-full" style={{ background: accentColor }} />
        <span style={{ color: titleColor, fontSize: titleSize, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</span>
      </div>

      {showSearch && stores.length > 2 && (
        <div className="flex-shrink-0 mb-2 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Buscar loja..."
            className="w-full h-8 rounded-lg border-none outline-none text-xs px-3"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 11 }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}
            >✕</button>
          )}
        </div>
      )}

      {showFilter && categories.length > 1 && (
        <div className="flex-shrink-0 flex gap-1.5 mb-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveCategory(null)}
            className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all"
            style={{
              background: !activeCategory ? accentColor : 'rgba(255,255,255,0.08)',
              color: !activeCategory ? '#fff' : 'rgba(255,255,255,0.6)',
              border: `1px solid ${!activeCategory ? accentColor : 'rgba(255,255,255,0.1)'}`,
            }}
          >Todas</button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all"
              style={{
                background: activeCategory === cat ? accentColor : 'rgba(255,255,255,0.08)',
                color: activeCategory === cat ? '#fff' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${activeCategory === cat ? accentColor : 'rgba(255,255,255,0.1)'}`,
              }}
            >{cat}</button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto" style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
        {filtered.map((store: any, idx: number) => (
          <div key={store.id} className="flex flex-col transition-colors animate-scale-in" style={{ background: cardBgColor, borderRadius: cardBorderRadius, border: '1px solid rgba(255,255,255,0.06)', animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
            <div className="flex gap-3 p-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: accentColor + '22', border: `1px solid ${accentColor}33` }}>
                {store.logo ? (
                  <img src={store.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-5 h-5" style={{ color: accentColor }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm leading-tight truncate">{store.name || 'Loja'}</div>
                {store.description && expandedId !== store.id && <div className="text-white/50 text-[10px] mt-0.5 line-clamp-1">{store.description}</div>}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                  {showFloor && store.floor && <span className="text-[10px] text-white/60 flex items-center gap-0.5">📍 {store.floor}</span>}
                  {showCategory && store.category && <span className="text-[10px] flex items-center gap-0.5" style={{ color: accentColor }}>🏷️ {store.category}</span>}
                </div>
              </div>
              <button
                onClick={() => setExpandedId(expandedId === store.id ? null : store.id)}
                className="flex-shrink-0 self-start px-2 py-1 rounded-md text-[9px] font-semibold transition-all"
                style={{
                  background: expandedId === store.id ? accentColor : accentColor + '22',
                  color: expandedId === store.id ? '#fff' : accentColor,
                  border: `1px solid ${accentColor}44`,
                }}
              >
                {expandedId === store.id ? '✕' : 'Detalhes'}
              </button>
            </div>
            {expandedId === store.id && (
              <div className="px-3 pb-3 pt-0 border-t border-white/5 mt-0" style={{ animation: 'storeCardIn 0.2s ease-out both' }}>
                {store.coverImage && (
                  <div className="mt-2 rounded-lg overflow-hidden" style={{ maxHeight: 120 }}>
                    <img src={store.coverImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {store.description && <div className="text-white/60 text-[10px] mt-2 leading-relaxed">{store.description}</div>}
                {store.gallery && store.gallery.length > 0 && (
                  <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {store.gallery.filter(Boolean).map((img: string, gi: number) => (
                      <div key={gi} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-1 mt-2">
                  {store.hours && <span className="text-[10px] text-white/60 flex items-center gap-1">🕐 Horário: {store.hours}</span>}
                  {store.phone && <span className="text-[10px] text-white/60 flex items-center gap-1">📞 Telefone: {store.phone}</span>}
                  {store.floor && <span className="text-[10px] text-white/60 flex items-center gap-1">📍 Localização: {store.floor}</span>}
                  {store.zone && <span className="text-[10px] text-white/60 flex items-center gap-1">🗺️ Zona: {store.zone}</span>}
                  {store.category && <span className="text-[10px] flex items-center gap-1" style={{ color: accentColor }}>🏷️ Categoria: {store.category}</span>}
                </div>
                <button
                  onClick={() => setExpandedId(null)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                  style={{
                    background: accentColor + '22',
                    color: accentColor,
                    border: `1px solid ${accentColor}44`,
                  }}
                >
                  ← Voltar para lista
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex items-center justify-center py-6">
            <span className="text-white/40 text-xs">Nenhuma loja nesta categoria</span>
          </div>
        )}
      </div>
    </div>
  );
}
