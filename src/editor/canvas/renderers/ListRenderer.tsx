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
  const dividerColor = props.dividerColor || 'rgba(255,255,255,0.1)';
  const bgColor = props.bgColor || 'rgba(0,0,0,0.4)';
  const borderRadius = props.borderRadius ?? 16;
  const titleSize = props.titleSize || 18;
  const showDivider = props.showDivider !== false;
  const showIcon = props.showIcon !== false;
  const showPrice = props.showPrice !== false;

  return (
    <div
      className="w-full h-full overflow-auto"
      style={{ background: bgColor, borderRadius, padding: 16 }}
    >
      {props.listTitle && (
        <p style={{ color: titleColor, fontSize: titleSize + 4, fontWeight: 700, marginBottom: 12 }}>
          {props.listTitle}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {items.map((item, i) => (
          <div key={item.id}>
            <div className="flex items-center gap-3 py-2.5 px-1">
              {showIcon && (
                item.image
                  ? <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  : <span className="text-2xl shrink-0">{item.icon || '•'}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: titleColor, fontSize: titleSize }}>{item.title}</p>
                {item.subtitle && (
                  <p className="truncate" style={{ color: subtitleColor, fontSize: titleSize - 4 }}>{item.subtitle}</p>
                )}
              </div>
              {showPrice && item.price && (
                <span className="font-bold shrink-0" style={{ color: priceColor, fontSize: titleSize }}>{item.price}</span>
              )}
            </div>
            {showDivider && i < items.length - 1 && (
              <div style={{ height: 1, background: dividerColor }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
