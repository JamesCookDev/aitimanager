import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export function QRCodeBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Conteúdo do QR Code</Label>
        <Input
          value={props.content || ''}
          onChange={(e) => setProp((p: any) => { p.content = e.target.value; })}
          placeholder="https://seu-site.com"
          className="mt-1"
        />
        <p className="text-[10px] text-muted-foreground mt-1">URL, texto ou qualquer conteúdo</p>
      </div>

      <div>
        <Label className="text-xs">Tamanho: {props.size}px</Label>
        <Slider min={80} max={300} step={4} value={[props.size || 160]} onValueChange={([v]) => setProp((p: any) => { p.size = v; })} className="mt-1" />
      </div>

      <div>
        <Label className="text-xs">Cor do QR</Label>
        <div className="flex gap-2 mt-1">
          <input type="color" value={props.fgColor || '#ffffff'} onChange={(e) => setProp((p: any) => { p.fgColor = e.target.value; })} className="w-8 h-8 rounded border border-border cursor-pointer" />
          <Input value={props.fgColor || '#ffffff'} onChange={(e) => setProp((p: any) => { p.fgColor = e.target.value; })} className="flex-1" />
        </div>
      </div>

      <div>
        <Label className="text-xs">Cor de fundo</Label>
        <div className="flex gap-2 mt-1">
          <input type="color" value={props.bgColor === 'transparent' ? '#000000' : (props.bgColor || '#000000')} onChange={(e) => setProp((p: any) => { p.bgColor = e.target.value; })} className="w-8 h-8 rounded border border-border cursor-pointer" />
          <Input value={props.bgColor || 'transparent'} onChange={(e) => setProp((p: any) => { p.bgColor = e.target.value; })} className="flex-1" placeholder="transparent" />
        </div>
      </div>

      <div>
        <Label className="text-xs">Borda arredondada: {props.borderRadius}px</Label>
        <Slider min={0} max={32} step={1} value={[props.borderRadius || 8]} onValueChange={([v]) => setProp((p: any) => { p.borderRadius = v; })} className="mt-1" />
      </div>

      <div>
        <Label className="text-xs">Padding: {props.padding}px</Label>
        <Slider min={0} max={40} step={2} value={[props.padding || 12]} onValueChange={([v]) => setProp((p: any) => { p.padding = v; })} className="mt-1" />
      </div>

      <div className="space-y-3 pt-2 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Legenda</h4>
        <div>
          <Label className="text-xs">Texto</Label>
          <Input value={props.label || ''} onChange={(e) => setProp((p: any) => { p.label = e.target.value; })} className="mt-1" placeholder="Escaneie o QR Code" />
        </div>
        <div>
          <Label className="text-xs">Cor do texto</Label>
          <div className="flex gap-2 mt-1">
            <input type="color" value={props.labelColor || '#ffffff'} onChange={(e) => setProp((p: any) => { p.labelColor = e.target.value; })} className="w-8 h-8 rounded border border-border cursor-pointer" />
            <Input value={props.labelColor || '#ffffff'} onChange={(e) => setProp((p: any) => { p.labelColor = e.target.value; })} className="flex-1" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Tamanho do texto: {props.labelSize}px</Label>
          <Slider min={8} max={24} step={1} value={[props.labelSize || 12]} onValueChange={([v]) => setProp((p: any) => { p.labelSize = v; })} className="mt-1" />
        </div>
      </div>
    </div>
  );
}
