import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CanvasView } from '../../types/canvas';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { Section, PropInput } from './shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string;
  variableName?: string;
}

interface Props {
  props: Record<string, any>;
  onChange: (p: Record<string, any>) => void;
  views?: CanvasView[];
}

const FIELD_TYPES = [
  { value: 'text', label: '📝 Texto' },
  { value: 'email', label: '📧 E-mail' },
  { value: 'phone', label: '📱 Telefone' },
  { value: 'select', label: '📋 Seleção' },
  { value: 'checkbox', label: '☑️ Checkbox' },
  { value: 'textarea', label: '📄 Área de texto' },
];

export function FormPropsPanel({ props, onChange, views }: Props) {
  const set = (key: string) => (val: any) => onChange({ [key]: val });
  const fields: FormField[] = props.fields || [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState('fields');

  const updateField = (id: string, patch: Partial<FormField>) => {
    onChange({ fields: fields.map(f => f.id === id ? { ...f, ...patch } : f) });
  };

  const addField = (type: FormField['type'] = 'text') => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: type === 'checkbox' ? 'Aceito os termos' : `Campo ${fields.length + 1}`,
      placeholder: '',
      required: false,
      options: type === 'select' ? 'Opção 1, Opção 2, Opção 3' : '',
    };
    onChange({ fields: [...fields, newField] });
    setExpandedId(newField.id);
  };

  const removeField = (id: string) => {
    onChange({ fields: fields.filter(f => f.id !== id) });
  };

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="w-full grid grid-cols-2 h-8">
        <TabsTrigger value="fields" className="text-[10px]">Campos</TabsTrigger>
        <TabsTrigger value="style" className="text-[10px]">Estilo</TabsTrigger>
      </TabsList>

      <TabsContent value="fields" className="space-y-2 mt-2">
        <Section title="Formulário">
          <PropInput label="Título" value={props.title || 'Check-in'} onChange={set('title')} />

          <div className="space-y-1.5">
            {fields.map((field) => (
              <div key={field.id} className="border border-border rounded-lg overflow-hidden">
                <div
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/30"
                  onClick={() => setExpandedId(expandedId === field.id ? null : field.id)}
                >
                  <GripVertical className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                  <span className="text-[11px] flex-1 truncate font-medium">{field.label}</span>
                  <span className="text-[9px] text-muted-foreground">{FIELD_TYPES.find(t => t.value === field.type)?.label}</span>
                  {expandedId === field.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>

                {expandedId === field.id && (
                  <div className="p-2 space-y-2 border-t border-border bg-muted/10">
                    <div>
                      <Label className="text-[11px]">Tipo</Label>
                      <Select value={field.type} onValueChange={(v) => updateField(field.id, { type: v as FormField['type'] })}>
                        <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <PropInput label="Label" value={field.label} onChange={(v) => updateField(field.id, { label: v })} />
                    <PropInput label="Placeholder" value={field.placeholder || ''} onChange={(v) => updateField(field.id, { placeholder: v })} />
                    {field.type === 'select' && (
                      <PropInput label="Opções (separadas por vírgula)" value={field.options || ''} onChange={(v) => updateField(field.id, { options: v })} />
                    )}
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px]">Obrigatório</Label>
                      <Switch checked={field.required === true} onCheckedChange={(v) => updateField(field.id, { required: v })} />
                    </div>
                    <Button variant="destructive" size="sm" className="w-full text-[10px] gap-1" onClick={() => removeField(field.id)}>
                      <Trash2 className="w-3 h-3" /> Remover campo
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <Button variant="outline" size="sm" className="text-[10px] gap-1" onClick={() => addField('text')}>
              <Plus className="w-3 h-3" /> Texto
            </Button>
            <Button variant="outline" size="sm" className="text-[10px] gap-1" onClick={() => addField('email')}>
              <Plus className="w-3 h-3" /> E-mail
            </Button>
            <Button variant="outline" size="sm" className="text-[10px] gap-1" onClick={() => addField('select')}>
              <Plus className="w-3 h-3" /> Seleção
            </Button>
            <Button variant="outline" size="sm" className="text-[10px] gap-1" onClick={() => addField('checkbox')}>
              <Plus className="w-3 h-3" /> Checkbox
            </Button>
          </div>
        </Section>

        <Section title="Botão de envio">
          <PropInput label="Texto do botão" value={props.submitLabel || 'Enviar'} onChange={set('submitLabel')} />
          <PropInput label="Mensagem de sucesso" value={props.successMessage || 'Enviado com sucesso! ✅'} onChange={set('successMessage')} />
        </Section>

        {views && views.length > 0 && (
          <Section title="🔗 Após enviar">
            <p className="text-[9px] text-muted-foreground mb-1">Os valores preenchidos são salvos como variáveis globais, acessíveis via {'{{variavel}}'} em textos de outras páginas.</p>
            <div>
              <Label className="text-[11px]">Navegar para página</Label>
              <Select value={props.navigateOnSubmit || ''} onValueChange={set('navigateOnSubmit')}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Mostrar sucesso (padrão)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tela de sucesso</SelectItem>
                  {views.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      <span className="flex items-center gap-1.5">📄 {v.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-2 p-2 rounded-lg bg-muted/30 space-y-0.5">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Variáveis dos campos:</p>
              {fields.map(f => {
                const varName = f.variableName || f.label.toLowerCase().replace(/\s+/g, '_');
                return <code key={f.id} className="text-[9px] text-primary block">{`{{${varName}}}`} ← {f.label}</code>;
              })}
            </div>
          </Section>
        )}
      </TabsContent>

      <TabsContent value="style" className="space-y-2 mt-2">
        <Section title="Aparência">
          <PropInput label="Cor do título" value={props.titleColor || '#ffffff'} onChange={set('titleColor')} type="color" />
          <PropInput label="Tamanho título" value={props.titleSize || 22} onChange={set('titleSize')} type="number" />
          <PropInput label="Cor de fundo" value={props.bgColor || 'rgba(0,0,0,0.5)'} onChange={set('bgColor')} type="color" />
          <PropInput label="Border Radius" value={props.borderRadius || 16} onChange={set('borderRadius')} type="number" />
          <PropInput label="Cor do campo" value={props.fieldBgColor || 'rgba(255,255,255,0.1)'} onChange={set('fieldBgColor')} type="color" />
          <PropInput label="Cor texto campo" value={props.fieldTextColor || '#ffffff'} onChange={set('fieldTextColor')} type="color" />
          <PropInput label="Cor do botão" value={props.submitBgColor || '#6366f1'} onChange={set('submitBgColor')} type="color" />
          <PropInput label="Cor texto botão" value={props.submitTextColor || '#ffffff'} onChange={set('submitTextColor')} type="color" />
          <PropInput label="Cor de destaque" value={props.accentColor || '#6366f1'} onChange={set('accentColor')} type="color" />
        </Section>
      </TabsContent>
    </Tabs>
  );
}
