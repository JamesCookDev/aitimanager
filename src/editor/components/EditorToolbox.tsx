import React from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Type, Image, MousePointer2, LayoutGrid, User, Minus, MoveVertical, Menu, Sparkles, Tag, CreditCard, BarChart3, Clock, Palette, Share2 } from 'lucide-react';

import { TextBlock } from './TextBlock';
import { ImageBlock } from './ImageBlock';
import { ButtonBlock } from './ButtonBlock';
import { ContainerBlock } from './ContainerBlock';
import { AvatarBlock } from './AvatarBlock';
import { SpacerBlock } from './SpacerBlock';
import { DividerBlock } from './DividerBlock';
import { MenuBlock } from './MenuBlock';
import { IconBlock } from './IconBlock';
import { BadgeBlock } from './BadgeBlock';
import { CardBlock } from './CardBlock';
import { ProgressBlock } from './ProgressBlock';
import { CountdownBlock } from './CountdownBlock';
import { GradientTextBlock } from './GradientTextBlock';
import { SocialLinksBlock } from './SocialLinksBlock';

const categories = [
  {
    label: 'Conteúdo',
    blocks: [
      { name: 'Texto', icon: Type, element: <TextBlock /> },
      { name: 'Gradiente', icon: Palette, element: <GradientTextBlock /> },
      { name: 'Imagem', icon: Image, element: <ImageBlock /> },
      { name: 'Ícone', icon: Sparkles, element: <IconBlock /> },
      { name: 'Badge', icon: Tag, element: <BadgeBlock /> },
    ],
  },
  {
    label: 'Interação',
    blocks: [
      { name: 'Botão', icon: MousePointer2, element: <ButtonBlock /> },
      { name: 'Menu', icon: Menu, element: <MenuBlock /> },
      { name: 'Social', icon: Share2, element: <SocialLinksBlock /> },
    ],
  },
  {
    label: 'Dados',
    blocks: [
      { name: 'Progresso', icon: BarChart3, element: <ProgressBlock /> },
      { name: 'Relógio', icon: Clock, element: <CountdownBlock /> },
    ],
  },
  {
    label: 'Layout',
    blocks: [
      { name: 'Container', icon: LayoutGrid, element: <Element is={ContainerBlock} canvas /> },
      { name: 'Card', icon: CreditCard, element: <Element is={CardBlock} canvas /> },
      { name: 'Espaçador', icon: MoveVertical, element: <SpacerBlock /> },
      { name: 'Divisor', icon: Minus, element: <DividerBlock /> },
    ],
  },
  {
    label: '3D / Avatar',
    blocks: [
      { name: 'Avatar', icon: User, element: <AvatarBlock /> },
    ],
  },
] as const;

export function EditorToolbox() {
  const { connectors } = useEditor();

  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <div key={cat.label}>
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            {cat.label}
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {cat.blocks.map((block) => (
              <div
                key={block.name}
                ref={(ref) => { if (ref) connectors.create(ref, block.element); }}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-border/50 bg-card hover:bg-primary/10 hover:border-primary/30 cursor-grab active:cursor-grabbing transition-all active:scale-95 group"
              >
                <block.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{block.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
