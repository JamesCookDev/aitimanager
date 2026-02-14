import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Wand2, Eye, Check } from 'lucide-react';

interface QuickAction {
  emoji: string;
  label: string;
  prompt: string;
  color: string;
}

interface MenuCategory {
  category_title: string;
  category_icon: string;
  buttons: QuickAction[];
}

interface LayoutConfig {
  avatar_position: string;
  avatar_scale: number;
  chat_position: string;
  bg_type: string;
  bg_color: string;
  bg_gradient: string;
  bg_image: string;
  show_floor: boolean;
  floor_color: string;
  show_wall: boolean;
  show_particles: boolean;
}

interface FullUiConfig {
  title: string;
  subtitle: string;
  layout: LayoutConfig;
  menu_categories: MenuCategory[];
}

interface EnvironmentPreset {
  name: string;
  icon: string;
  description: string;
  tags: string[];
  config: FullUiConfig;
}

const PRESETS: EnvironmentPreset[] = [
  {
    name: 'Restaurante',
    icon: '🍽️',
    description: 'Ambiente acolhedor para restaurantes e food courts com categorias de cardápio',
    tags: ['Alimentação', 'Cardápio'],
    config: {
      title: 'Bem-vindo ao Restaurante',
      subtitle: 'O que gostaria de saber?',
      layout: {
        avatar_position: 'left',
        avatar_scale: 1.7,
        chat_position: 'right',
        bg_type: 'gradient',
        bg_color: '#1a0a00',
        bg_gradient: 'linear-gradient(135deg, #1a0a00, #2d1810)',
        bg_image: '',
        show_floor: true,
        floor_color: '#3d2817',
        show_wall: true,
        show_particles: true,
      },
      menu_categories: [
        {
          category_title: 'Cardápio',
          category_icon: '📋',
          buttons: [
            { emoji: '🍕', label: 'Pizzas', prompt: 'Quais pizzas vocês têm no cardápio?', color: 'from-orange-400 to-red-400' },
            { emoji: '🍔', label: 'Hambúrgueres', prompt: 'Me mostre os hambúrgueres disponíveis', color: 'from-yellow-400 to-orange-400' },
            { emoji: '🥗', label: 'Saladas', prompt: 'Quais opções de salada vocês oferecem?', color: 'from-green-400 to-emerald-400' },
            { emoji: '🍰', label: 'Sobremesas', prompt: 'Quais sobremesas estão disponíveis?', color: 'from-pink-400 to-rose-400' },
          ],
        },
        {
          category_title: 'Informações',
          category_icon: 'ℹ️',
          buttons: [
            { emoji: '⏰', label: 'Horários', prompt: 'Quais são os horários de funcionamento?', color: 'from-blue-400 to-indigo-400' },
            { emoji: '📍', label: 'Localização', prompt: 'Onde vocês ficam localizados?', color: 'from-teal-400 to-cyan-400' },
            { emoji: '📞', label: 'Reservas', prompt: 'Como faço uma reserva?', color: 'from-purple-400 to-pink-400' },
          ],
        },
      ],
    },
  },
  {
    name: 'Shopping Center',
    icon: '🛍️',
    description: 'Guia interativo para shoppings com mapa de lojas e serviços',
    tags: ['Varejo', 'Navegação'],
    config: {
      title: 'Bem-vindo ao Shopping',
      subtitle: 'Como posso te ajudar hoje?',
      layout: {
        avatar_position: 'right',
        avatar_scale: 1.6,
        chat_position: 'left',
        bg_type: 'gradient',
        bg_color: '#0a0a1a',
        bg_gradient: 'linear-gradient(135deg, #0a0a1a, #1a1a3e)',
        bg_image: '',
        show_floor: true,
        floor_color: '#1e1e3a',
        show_wall: true,
        show_particles: true,
      },
      menu_categories: [
        {
          category_title: 'Lojas',
          category_icon: '🏪',
          buttons: [
            { emoji: '👗', label: 'Moda', prompt: 'Quais lojas de moda têm no shopping?', color: 'from-pink-400 to-rose-400' },
            { emoji: '📱', label: 'Tecnologia', prompt: 'Onde encontro lojas de eletrônicos e tecnologia?', color: 'from-blue-400 to-indigo-400' },
            { emoji: '🏠', label: 'Casa & Decoração', prompt: 'Quais lojas de casa e decoração estão disponíveis?', color: 'from-orange-400 to-yellow-400' },
          ],
        },
        {
          category_title: 'Alimentação',
          category_icon: '🍔',
          buttons: [
            { emoji: '🍕', label: 'Praça de Alimentação', prompt: 'O que tem na praça de alimentação?', color: 'from-orange-400 to-red-400' },
            { emoji: '☕', label: 'Cafeterias', prompt: 'Quais cafeterias existem no shopping?', color: 'from-yellow-700 to-orange-400' },
          ],
        },
        {
          category_title: 'Serviços',
          category_icon: '🔧',
          buttons: [
            { emoji: '🅿️', label: 'Estacionamento', prompt: 'Como funciona o estacionamento?', color: 'from-teal-400 to-cyan-400' },
            { emoji: '🎬', label: 'Cinema', prompt: 'Quais filmes estão em cartaz?', color: 'from-purple-400 to-pink-400' },
            { emoji: '🚻', label: 'Banheiros', prompt: 'Onde ficam os banheiros mais próximos?', color: 'from-green-400 to-emerald-400' },
          ],
        },
      ],
    },
  },
  {
    name: 'Hospital / Clínica',
    icon: '🏥',
    description: 'Interface acessível e clara para ambientes de saúde',
    tags: ['Saúde', 'Acessibilidade'],
    config: {
      title: 'Central de Informações',
      subtitle: 'Estou aqui para te orientar',
      layout: {
        avatar_position: 'left',
        avatar_scale: 1.5,
        chat_position: 'right',
        bg_type: 'solid',
        bg_color: '#0d2137',
        bg_gradient: '',
        bg_image: '',
        show_floor: true,
        floor_color: '#162d4a',
        show_wall: true,
        show_particles: false,
      },
      menu_categories: [
        {
          category_title: 'Atendimento',
          category_icon: '🩺',
          buttons: [
            { emoji: '📋', label: 'Agendar Consulta', prompt: 'Como faço para agendar uma consulta?', color: 'from-blue-400 to-indigo-400' },
            { emoji: '🔬', label: 'Exames', prompt: 'Quais exames vocês realizam e como agendar?', color: 'from-teal-400 to-cyan-400' },
            { emoji: '💊', label: 'Farmácia', prompt: 'Onde fica a farmácia e qual o horário?', color: 'from-green-400 to-emerald-400' },
          ],
        },
        {
          category_title: 'Navegação',
          category_icon: '🗺️',
          buttons: [
            { emoji: '🚑', label: 'Emergência', prompt: 'Onde fica a emergência?', color: 'from-rose-400 to-red-400' },
            { emoji: '🛗', label: 'Andares', prompt: 'Quais especialidades ficam em cada andar?', color: 'from-purple-400 to-pink-400' },
            { emoji: '🅿️', label: 'Estacionamento', prompt: 'Como funciona o estacionamento?', color: 'from-orange-400 to-yellow-400' },
          ],
        },
        {
          category_title: 'Informações',
          category_icon: 'ℹ️',
          buttons: [
            { emoji: '⏰', label: 'Horários', prompt: 'Quais são os horários de funcionamento?', color: 'from-blue-400 to-indigo-400' },
            { emoji: '📞', label: 'Contato', prompt: 'Qual o telefone e email de contato?', color: 'from-teal-400 to-cyan-400' },
          ],
        },
      ],
    },
  },
  {
    name: 'Hotel',
    icon: '🏨',
    description: 'Concierge virtual para hóspedes com serviços e informações',
    tags: ['Hospitalidade', 'Turismo'],
    config: {
      title: 'Concierge Virtual',
      subtitle: 'Em que posso ser útil?',
      layout: {
        avatar_position: 'center',
        avatar_scale: 1.8,
        chat_position: 'right',
        bg_type: 'gradient',
        bg_color: '#0f172a',
        bg_gradient: 'linear-gradient(135deg, #0f172a, #1e293b)',
        bg_image: '',
        show_floor: true,
        floor_color: '#1e293b',
        show_wall: true,
        show_particles: true,
      },
      menu_categories: [
        {
          category_title: 'Serviços do Hotel',
          category_icon: '🛎️',
          buttons: [
            { emoji: '🍳', label: 'Café da manhã', prompt: 'Qual o horário e local do café da manhã?', color: 'from-orange-400 to-yellow-400' },
            { emoji: '🏊', label: 'Piscina & Spa', prompt: 'Quais são os horários da piscina e spa?', color: 'from-teal-400 to-cyan-400' },
            { emoji: '🧹', label: 'Serviço de Quarto', prompt: 'Como solicitar serviço de quarto?', color: 'from-purple-400 to-pink-400' },
            { emoji: '📶', label: 'Wi-Fi', prompt: 'Qual a senha do Wi-Fi?', color: 'from-blue-400 to-indigo-400' },
          ],
        },
        {
          category_title: 'Explorar a Região',
          category_icon: '🗺️',
          buttons: [
            { emoji: '🏖️', label: 'Praias', prompt: 'Quais praias ficam perto do hotel?', color: 'from-teal-400 to-cyan-400' },
            { emoji: '🍽️', label: 'Restaurantes', prompt: 'Quais restaurantes você recomenda na região?', color: 'from-orange-400 to-red-400' },
            { emoji: '🎭', label: 'Passeios', prompt: 'Quais passeios turísticos estão disponíveis?', color: 'from-green-400 to-emerald-400' },
          ],
        },
      ],
    },
  },
  {
    name: 'Museu / Exposição',
    icon: '🎨',
    description: 'Guia interativo para museus e espaços culturais',
    tags: ['Cultura', 'Educação'],
    config: {
      title: 'Guia do Museu',
      subtitle: 'Descubra nossas exposições',
      layout: {
        avatar_position: 'left',
        avatar_scale: 1.6,
        chat_position: 'right',
        bg_type: 'solid',
        bg_color: '#0f0f1a',
        bg_gradient: '',
        bg_image: '',
        show_floor: true,
        floor_color: '#1a1a2e',
        show_wall: true,
        show_particles: true,
      },
      menu_categories: [
        {
          category_title: 'Exposições',
          category_icon: '🖼️',
          buttons: [
            { emoji: '🎭', label: 'Em Cartaz', prompt: 'Quais exposições estão em cartaz atualmente?', color: 'from-purple-400 to-pink-400' },
            { emoji: '📅', label: 'Programação', prompt: 'Qual a programação desta semana?', color: 'from-blue-400 to-indigo-400' },
            { emoji: '🎟️', label: 'Ingressos', prompt: 'Como compro ingressos e qual o preço?', color: 'from-orange-400 to-yellow-400' },
          ],
        },
        {
          category_title: 'Informações',
          category_icon: 'ℹ️',
          buttons: [
            { emoji: '🗺️', label: 'Mapa do Museu', prompt: 'Pode me mostrar o mapa do museu?', color: 'from-teal-400 to-cyan-400' },
            { emoji: '♿', label: 'Acessibilidade', prompt: 'Quais recursos de acessibilidade vocês oferecem?', color: 'from-green-400 to-emerald-400' },
            { emoji: '📍', label: 'Como Chegar', prompt: 'Como chego ao museu de transporte público?', color: 'from-rose-400 to-red-400' },
          ],
        },
      ],
    },
  },
  {
    name: 'Aeroporto',
    icon: '✈️',
    description: 'Assistente de embarque e informações de voo',
    tags: ['Transporte', 'Viagem'],
    config: {
      title: 'Assistente do Aeroporto',
      subtitle: 'Boa viagem! Como posso ajudar?',
      layout: {
        avatar_position: 'center',
        avatar_scale: 1.5,
        chat_position: 'right',
        bg_type: 'gradient',
        bg_color: '#020617',
        bg_gradient: 'linear-gradient(135deg, #020617, #0f172a)',
        bg_image: '',
        show_floor: true,
        floor_color: '#1e293b',
        show_wall: true,
        show_particles: false,
      },
      menu_categories: [
        {
          category_title: 'Voos',
          category_icon: '✈️',
          buttons: [
            { emoji: '🛫', label: 'Partidas', prompt: 'Quais são os próximos voos de partida?', color: 'from-blue-400 to-indigo-400' },
            { emoji: '🛬', label: 'Chegadas', prompt: 'Quais voos estão chegando agora?', color: 'from-teal-400 to-cyan-400' },
            { emoji: '🚪', label: 'Portões', prompt: 'Onde fica o meu portão de embarque?', color: 'from-purple-400 to-pink-400' },
          ],
        },
        {
          category_title: 'Serviços',
          category_icon: '🔧',
          buttons: [
            { emoji: '🧳', label: 'Bagagem', prompt: 'Onde fica a esteira de bagagens?', color: 'from-orange-400 to-yellow-400' },
            { emoji: '🛒', label: 'Duty Free', prompt: 'Onde ficam as lojas duty free?', color: 'from-pink-400 to-rose-400' },
            { emoji: '🍽️', label: 'Alimentação', prompt: 'Quais restaurantes e cafés tem no aeroporto?', color: 'from-green-400 to-emerald-400' },
            { emoji: '💱', label: 'Câmbio', prompt: 'Onde posso fazer câmbio de moeda?', color: 'from-yellow-400 to-orange-400' },
          ],
        },
      ],
    },
  },
];

interface EnvironmentPresetsProps {
  deviceId: string;
  currentUiConfig: Record<string, any> | null;
  onApplied: () => void;
}

export function EnvironmentPresets({ deviceId, currentUiConfig, onApplied }: EnvironmentPresetsProps) {
  const [previewPreset, setPreviewPreset] = useState<EnvironmentPreset | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApply = async (preset: EnvironmentPreset) => {
    setApplying(true);
    try {
      // Merge with any existing layout_templates or other custom fields
      const newConfig: any = {
        ...preset.config,
      };

      const { error } = await supabase
        .from('devices')
        .update({ ui_config: newConfig })
        .eq('id', deviceId);

      if (error) throw error;

      toast.success(`Ambiente "${preset.name}" aplicado com sucesso!`, {
        description: 'Menu, layout e cenário foram configurados. Recarregue para ver as mudanças nos editores abaixo.',
      });
      setPreviewPreset(null);
      onApplied();
    } catch (error) {
      console.error('Erro ao aplicar preset:', error);
      toast.error('Erro ao aplicar ambiente');
    } finally {
      setApplying(false);
    }
  };

  const getPreviewBg = (layout: LayoutConfig): string => {
    if (layout.bg_type === 'gradient') return layout.bg_gradient;
    if (layout.bg_type === 'image' && layout.bg_image) return `url(${layout.bg_image}) center/cover no-repeat`;
    return layout.bg_color;
  };

  return (
    <>
      <Card className="card-industrial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Ambientes Pré-configurados
          </CardTitle>
          <CardDescription>
            Aplique um ambiente completo com um clique — configura menu, layout e cenário de uma vez
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setPreviewPreset(preset)}
                className="group relative flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-left overflow-hidden"
              >
                {/* Mini preview background */}
                <div
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ background: getPreviewBg(preset.config.layout) }}
                />
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <span className="text-3xl">{preset.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{preset.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{preset.description}</p>
                  </div>
                </div>
                <div className="relative z-10 flex flex-wrap gap-1 mt-1">
                  {preset.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {preset.config.menu_categories.reduce((s, c) => s + c.buttons.length, 0)} botões
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewPreset} onOpenChange={(open) => !open && setPreviewPreset(null)}>
        {previewPreset && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-3xl">{previewPreset.icon}</span>
                {previewPreset.name}
              </DialogTitle>
              <DialogDescription>{previewPreset.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Scene preview */}
              <div
                className="rounded-xl border border-border overflow-hidden h-32"
                style={{ background: getPreviewBg(previewPreset.config.layout) }}
              >
                <div className="relative h-full flex items-end">
                  {previewPreset.config.layout.show_particles && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 rounded-full bg-white/20 animate-pulse"
                          style={{ left: `${15 + i * 17}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.3}s` }}
                        />
                      ))}
                    </div>
                  )}
                  {previewPreset.config.layout.show_floor && (
                    <div className="w-full h-6" style={{ background: previewPreset.config.layout.floor_color }} />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Título</p>
                  <p className="font-semibold text-foreground">{previewPreset.config.title}</p>
                  <p className="text-xs text-muted-foreground">{previewPreset.config.subtitle}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Estrutura</p>
                  <p className="font-semibold text-foreground">{previewPreset.config.menu_categories.length} categorias</p>
                  <p className="text-xs text-muted-foreground">
                    {previewPreset.config.menu_categories.reduce((s, c) => s + c.buttons.length, 0)} botões no total
                  </p>
                </div>
              </div>

              {/* Categories preview */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Menu incluído</p>
                {previewPreset.config.menu_categories.map((cat, ci) => (
                  <div key={ci} className="p-3 rounded-lg border border-border bg-card">
                    <p className="text-sm font-semibold mb-2">{cat.category_icon} {cat.category_title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.buttons.map((btn, bi) => (
                        <span
                          key={bi}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${btn.color} text-white text-xs font-medium shadow-sm`}
                        >
                          {btn.emoji} {btn.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setPreviewPreset(null)}>Cancelar</Button>
              <Button onClick={() => handleApply(previewPreset)} disabled={applying}>
                <Check className="w-4 h-4 mr-2" />
                {applying ? 'Aplicando...' : 'Aplicar Ambiente Completo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
