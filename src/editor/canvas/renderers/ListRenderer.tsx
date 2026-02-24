interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
  icon?: string;
  image?: string;
}

export function ListRenderer(props: any) {
  const items: ListItem[] = props.items || [
    { id: '1', title: 'Item 1', subtitle: 'Descrição', price: 'R$ 29,90', icon: '🍔' },
    { id: '2', title: 'Item 2', subtitle: 'Descrição', price: 'R$ 19,90', icon: '🍟' },
    { id: '3', title: 'Item 3', subtitle: 'Descrição', price: 'R$ 14,90', icon: '🥤' },
  ];

  const titleColor = props.titleColor || '#ffffff';
  const subtitleColor = props.subtitleColor || 'rgba(255,255,255,0.6)';
  const priceColor = props.priceColor || '#6366f1';
  const dividerColor = props.dividerColor || 'rgba(255,255,255,0.06)';
  const bgColor = props.bgColor || 'rgba(0,0,0,0.4)';
  const borderRadius = props.borderRadius ?? 16;
  const titleSize = props.titleSize || 18;
  const showDivider = props.showDivider !== false;
  const showIcon = props.showIcon !== false;
  const showPrice = props.showPrice !== false;

  return (
    <div
      className="w-full h-full overflow-auto"
      style={{
        background: `linear-gradient(160deg, ${bgColor}, rgba(0,0,0,0.55))`,
        borderRadius, padding: 16,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {props.listTitle && (
        <p style={{
          color: titleColor, fontSize: titleSize + 4, fontWeight: 700, marginBottom: 14,
          letterSpacing: '-0.01em',
        }}>
          {props.listTitle}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <div key={item.id}>
            <div
              className="flex items-center gap-3 py-3 px-3 transition-all"
              style={{
                borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {showIcon && (
                item.image
                  ? <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
                  : <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)', fontSize: 26 }}>{item.icon || '•'}</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: titleColor, fontSize: titleSize }}>{item.title}</p>
                {item.subtitle && (
                  <p className="truncate" style={{ color: subtitleColor, fontSize: titleSize - 4 }}>{item.subtitle}</p>
                )}
              </div>
              {showPrice && item.price && (
                <span className="font-bold shrink-0 px-3 py-1 rounded-lg" style={{
                  color: priceColor, fontSize: titleSize,
                  background: `${priceColor}12`,
                  border: `1px solid ${priceColor}22`,
                }}>
                  {item.price}
                </span>
              )}
            </div>
            {showDivider && i < items.length - 1 && (
              <div style={{ height: 1, background: dividerColor, margin: '0 12px' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
