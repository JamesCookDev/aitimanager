import React from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Type, Image, MousePointer2, LayoutGrid } from 'lucide-react';

import { TextBlock } from './TextBlock';
import { ImageBlock } from './ImageBlock';
import { ButtonBlock } from './ButtonBlock';
import { ContainerBlock } from './ContainerBlock';

const blocks = [
  { name: 'Texto', icon: Type, element: <TextBlock /> },
  { name: 'Imagem', icon: Image, element: <ImageBlock /> },
  { name: 'Botão', icon: MousePointer2, element: <ButtonBlock /> },
  { name: 'Container', icon: LayoutGrid, element: <Element is={ContainerBlock} canvas /> },
] as const;

export function EditorToolbox() {
  const { connectors } = useEditor();

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Blocos
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {blocks.map((block) => (
          <div
            key={block.name}
            ref={(ref) => { if (ref) connectors.create(ref, block.element); }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30 cursor-grab active:cursor-grabbing transition-colors touch-manipulation"
          >
            <block.icon className="w-5 h-5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">{block.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
