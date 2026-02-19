import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LayoutSettingsPanel } from '../shared/LayoutSettingsPanel';
import { ENV_PRESETS } from '../components/SceneBlock';

function ColorRow({ label, propKey, props, setProp }: {
  label: string; propKey: string;
  props: Record<string, any>; setProp: (fn: (p: any) => void) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <div className="flex gap-1.5 items-center">
        <input type="color" value={props[propKey] || '#000000'}
          onChange={e => setProp(p => { p[propKey] = e.target.value; })}
          className="h-7 w-9 rounded border border-border cursor-pointer shrink-0" />
        <Input value={props[propKey] || ''} onChange={e => setProp(p => { p[propKey] = e.target.value; })}
          className="flex-1 h-7 text-xs font-mono" />
      </div>
    </div>
  );
}

function NumRow({ label, propKey, min, max, step, props, setProp, unit = '' }: {
  label: string; propKey: string; min: number; max: number; step: number;
  props: Record<string, any>; setProp: (fn: (p: any) => void) => void; unit?: string;
}) {
  const val = typeof props[propKey] === 'number' ? props[propKey] : (min + max) / 2;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] text-muted-foreground">{label}</Label>
        <span className="text-[10px] font-mono text-muted-foreground">{val.toFixed(step < 1 ? 2 : 0)}{unit}</span>
      </div>
      <Slider min={min} max={max} step={step} value={[val]}
        onValueChange={([v]) => setProp(p => { p[propKey] = v; })} />
    </div>
  );
}

function Vec3Row({ label, xKey, yKey, zKey, props, setProp, min = -20, max = 20 }: {
  label: string; xKey: string; yKey: string; zKey: string;
  props: Record<string, any>; setProp: (fn: (p: any) => void) => void;
  min?: number; max?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <div className="grid grid-cols-3 gap-1">
        {[['X', xKey], ['Y', yKey], ['Z', zKey]].map(([axis, key]) => (
          <div key={key} className="space-y-0.5">
            <Label className="text-[9px] text-muted-foreground/60">{axis}</Label>
            <Input
              type="number" min={min} max={max} step={0.1}
              value={props[key] ?? 0}
              onChange={e => setProp(p => { p[key] = parseFloat(e.target.value) || 0; })}
              className="h-7 text-xs font-mono px-1.5"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SceneBlockSettings() {
  const { actions: { setProp }, props } = useNode(node => ({
    props: node.data.props as Record<string, any>,
  }));

  return (
    <div className="space-y-3 p-3">
      <Accordion type="multiple" defaultValue={['env', 'camera', 'ambient', 'directional', 'spot', 'points', 'floor', 'wall', 'particles', 'shadows']}>

        {/* Environment */}
        <AccordionItem value="env" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">🌍 Environment</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Preset HDR</Label>
              <Select value={props.envPreset || 'city'} onValueChange={v => setProp(p => { p.envPreset = v; })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENV_PRESETS.map(p => (
                    <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground/60">Define o mapa de reflexo e iluminação global da cena.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Camera */}
        <AccordionItem value="camera" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">📷 Câmera</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <Vec3Row label="Posição" xKey="camPosX" yKey="camPosY" zKey="camPosZ" props={props} setProp={setProp} min={-20} max={20} />
            <Vec3Row label="Alvo (LookAt)" xKey="camTargetX" yKey="camTargetY" zKey="camTargetZ" props={props} setProp={setProp} min={-10} max={10} />
            <div className="grid grid-cols-2 gap-2">
              <NumRow label="Dist. mínima" propKey="camMinDist" min={0.5} max={20} step={0.5} props={props} setProp={setProp} />
              <NumRow label="Dist. máxima" propKey="camMaxDist" min={1} max={30} step={0.5} props={props} setProp={setProp} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Ambient */}
        <AccordionItem value="ambient" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">💡 Luz Ambiente</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Habilitada</Label>
              <Switch checked={props.ambientEnabled !== false} onCheckedChange={v => setProp(p => { p.ambientEnabled = v; })} />
            </div>
            <NumRow label="Intensidade" propKey="ambientIntensity" min={0} max={3} step={0.05} props={props} setProp={setProp} />
          </AccordionContent>
        </AccordionItem>

        {/* Directional main */}
        <AccordionItem value="directional" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">☀️ Luz Direcional Principal</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Habilitada</Label>
              <Switch checked={props.dirLightEnabled !== false} onCheckedChange={v => setProp(p => { p.dirLightEnabled = v; })} />
            </div>
            <ColorRow label="Cor" propKey="dirLightColor" props={props} setProp={setProp} />
            <NumRow label="Intensidade" propKey="dirLightIntensity" min={0} max={5} step={0.1} props={props} setProp={setProp} />
            <Vec3Row label="Posição" xKey="dirLightPosX" yKey="dirLightPosY" zKey="dirLightPosZ" props={props} setProp={setProp} />
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Projetar sombra</Label>
              <Switch checked={props.dirLightCastShadow !== false} onCheckedChange={v => setProp(p => { p.dirLightCastShadow = v; })} />
            </div>
            {/* Fill */}
            <div className="pt-2 border-t border-border/30 space-y-2">
              <Label className="text-[10px] font-semibold text-muted-foreground">Luz de Preenchimento (Fill)</Label>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Habilitada</Label>
                <Switch checked={props.fillLightEnabled !== false} onCheckedChange={v => setProp(p => { p.fillLightEnabled = v; })} />
              </div>
              <ColorRow label="Cor" propKey="fillLightColor" props={props} setProp={setProp} />
              <NumRow label="Intensidade" propKey="fillLightIntensity" min={0} max={3} step={0.05} props={props} setProp={setProp} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Spot */}
        <AccordionItem value="spot" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">🔦 Spot Light</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Habilitada</Label>
              <Switch checked={props.spotLightEnabled !== false} onCheckedChange={v => setProp(p => { p.spotLightEnabled = v; })} />
            </div>
            <ColorRow label="Cor" propKey="spotLightColor" props={props} setProp={setProp} />
            <NumRow label="Intensidade" propKey="spotLightIntensity" min={0} max={5} step={0.1} props={props} setProp={setProp} />
            <Vec3Row label="Posição" xKey="spotLightPosX" yKey="spotLightPosY" zKey="spotLightPosZ" props={props} setProp={setProp} />
            <NumRow label="Ângulo (cone)" propKey="spotLightAngle" min={0.05} max={1.5} step={0.05} props={props} setProp={setProp} unit=" rad" />
            <NumRow label="Penumbra (suavidade borda)" propKey="spotLightPenumbra" min={0} max={1} step={0.05} props={props} setProp={setProp} />
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Projetar sombra</Label>
              <Switch checked={props.spotLightCastShadow !== false} onCheckedChange={v => setProp(p => { p.spotLightCastShadow = v; })} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Point lights */}
        <AccordionItem value="points" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">💠 Luzes de Destaque (Point)</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <div className="space-y-2 p-2 rounded-lg border border-border/40 bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-semibold text-muted-foreground">Acento 1 (esquerda)</Label>
                <Switch checked={props.pointLight1Enabled !== false} onCheckedChange={v => setProp(p => { p.pointLight1Enabled = v; })} />
              </div>
              <ColorRow label="Cor" propKey="pointLight1Color" props={props} setProp={setProp} />
              <NumRow label="Intensidade" propKey="pointLight1Intensity" min={0} max={3} step={0.05} props={props} setProp={setProp} />
            </div>
            <div className="space-y-2 p-2 rounded-lg border border-border/40 bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-semibold text-muted-foreground">Acento 2 (direita)</Label>
                <Switch checked={props.pointLight2Enabled !== false} onCheckedChange={v => setProp(p => { p.pointLight2Enabled = v; })} />
              </div>
              <ColorRow label="Cor" propKey="pointLight2Color" props={props} setProp={setProp} />
              <NumRow label="Intensidade" propKey="pointLight2Intensity" min={0} max={3} step={0.05} props={props} setProp={setProp} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Floor */}
        <AccordionItem value="floor" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">🏢 Chão 3D</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Mostrar chão</Label>
              <Switch checked={props.showFloor !== false} onCheckedChange={v => setProp(p => { p.showFloor = v; })} />
            </div>
            <ColorRow label="Cor" propKey="floorColor" props={props} setProp={setProp} />
            <div className="grid grid-cols-2 gap-2">
              <NumRow label="Largura" propKey="floorWidth" min={5} max={50} step={1} props={props} setProp={setProp} unit="u" />
              <NumRow label="Profundidade" propKey="floorHeight" min={5} max={50} step={1} props={props} setProp={setProp} unit="u" />
            </div>
            <NumRow label="Roughness" propKey="floorRoughness" min={0} max={1} step={0.05} props={props} setProp={setProp} />
            <NumRow label="Metalness" propKey="floorMetalness" min={0} max={1} step={0.05} props={props} setProp={setProp} />
          </AccordionContent>
        </AccordionItem>

        {/* Wall */}
        <AccordionItem value="wall" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">🧱 Parede 3D</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Mostrar parede</Label>
              <Switch checked={props.showWall !== false} onCheckedChange={v => setProp(p => { p.showWall = v; })} />
            </div>
            <ColorRow label="Cor" propKey="wallColor" props={props} setProp={setProp} />
            <div className="grid grid-cols-2 gap-2">
              <NumRow label="Largura" propKey="wallWidth" min={5} max={50} step={1} props={props} setProp={setProp} unit="u" />
              <NumRow label="Altura" propKey="wallHeight" min={3} max={30} step={0.5} props={props} setProp={setProp} unit="u" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumRow label="Pos. Y" propKey="wallPosY" min={0} max={15} step={0.5} props={props} setProp={setProp} />
              <NumRow label="Pos. Z" propKey="wallPosZ" min={-20} max={0} step={0.5} props={props} setProp={setProp} />
            </div>
            <NumRow label="Roughness" propKey="wallRoughness" min={0} max={1} step={0.05} props={props} setProp={setProp} />
            <NumRow label="Metalness" propKey="wallMetalness" min={0} max={1} step={0.05} props={props} setProp={setProp} />
          </AccordionContent>
        </AccordionItem>

        {/* Particles */}
        <AccordionItem value="particles" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">✨ Partículas</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Mostrar partículas</Label>
              <Switch checked={props.showParticles !== false} onCheckedChange={v => setProp(p => { p.showParticles = v; })} />
            </div>
            <ColorRow label="Cor" propKey="particleColor" props={props} setProp={setProp} />
            <NumRow label="Quantidade" propKey="particleCount" min={5} max={200} step={5} props={props} setProp={setProp} />
            <NumRow label="Tamanho" propKey="particleSize" min={0.5} max={8} step={0.5} props={props} setProp={setProp} />
            <NumRow label="Velocidade" propKey="particleSpeed" min={0} max={2} step={0.05} props={props} setProp={setProp} />
            <NumRow label="Opacidade" propKey="particleOpacity" min={0} max={1} step={0.05} props={props} setProp={setProp} />
            <NumRow label="Escala (área)" propKey="particleScale" min={1} max={30} step={1} props={props} setProp={setProp} />
          </AccordionContent>
        </AccordionItem>

        {/* Shadows */}
        <AccordionItem value="shadows" className="border-b-0 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">🌑 Sombras de Contato</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2.5">
            <NumRow label="Opacidade" propKey="shadowOpacity" min={0} max={1} step={0.05} props={props} setProp={setProp} />
            <NumRow label="Blur (suavidade)" propKey="shadowBlur" min={0} max={10} step={0.5} props={props} setProp={setProp} />
            <NumRow label="Escala" propKey="shadowScale" min={1} max={30} step={1} props={props} setProp={setProp} />
            <ColorRow label="Cor da sombra" propKey="shadowColor" props={props} setProp={setProp} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <LayoutSettingsPanel />
    </div>
  );
}
