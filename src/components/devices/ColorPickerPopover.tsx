import { useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

interface ColorPickerPopoverProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPickerPopover({ color, onChange, label }: ColorPickerPopoverProps) {
  return (
    <div className="space-y-1.5">
      {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors w-full"
          >
            <div
              className="w-7 h-7 rounded-md border border-border shadow-inner flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-mono text-muted-foreground">{color}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 space-y-3" align="start">
          <HexColorPicker color={color} onChange={onChange} style={{ width: '200px', height: '160px' }} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">#</span>
            <HexColorInput
              color={color}
              onChange={onChange}
              prefixed
              className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
