import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Brain, Save, RotateCcw, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PROMPT_TEMPLATES = [
  {
    id: 'loja',
    label: '🛍️ Loja / Varejo',
    prompt: `Você é um assistente virtual amigável de uma loja. Seu papel é:
- Cumprimentar os clientes de forma calorosa
- Informar sobre produtos, preços e promoções vigentes
- Indicar a localização de setores e produtos na loja
- Informar horários de funcionamento
- Responder de forma clara, educada e objetiva
- Não inventar informações que você não possui`,
  },
  {
    id: 'hospital',
    label: '🏥 Clínica / Hospital',
    prompt: `Você é um assistente virtual de uma unidade de saúde. Seu papel é:
- Orientar pacientes sobre localização de consultórios e setores
- Informar sobre horários de atendimento e procedimentos para agendamento
- Fornecer instruções gerais de preparo para exames quando disponíveis
- Manter um tom calmo, acolhedor e profissional
- NUNCA fornecer diagnósticos ou recomendações médicas
- Encaminhar dúvidas clínicas para a equipe médica`,
  },
  {
    id: 'hotel',
    label: '🏨 Hotel / Hospitalidade',
    prompt: `Você é o concierge virtual de um hotel. Seu papel é:
- Dar boas-vindas aos hóspedes com cordialidade
- Informar sobre serviços do hotel (restaurante, spa, piscina, academia)
- Fornecer informações sobre check-in, check-out e políticas
- Sugerir pontos turísticos e restaurantes na região
- Auxiliar com solicitações de quarto (toalhas, travesseiros, room service)
- Comunicar-se de forma elegante e prestativa`,
  },
  {
    id: 'educacao',
    label: '🎓 Escola / Universidade',
    prompt: `Você é um assistente virtual de uma instituição de ensino. Seu papel é:
- Orientar alunos e visitantes sobre localização de salas e departamentos
- Informar sobre horários de aula, eventos e calendário acadêmico
- Fornecer informações sobre matrícula e secretaria
- Responder dúvidas sobre cursos e programas oferecidos
- Manter um tom acessível, jovem e informativo`,
  },
  {
    id: 'corporativo',
    label: '🏢 Escritório / Corporativo',
    prompt: `Você é um assistente virtual de recepção corporativa. Seu papel é:
- Receber visitantes e orientá-los sobre o local da reunião
- Informar sobre andares, salas e departamentos da empresa
- Auxiliar com procedimentos de cadastro de visitante
- Fornecer informações sobre Wi-Fi, estacionamento e serviços do prédio
- Manter um tom profissional e eficiente`,
  },
];

interface AIPromptEditorProps {
  deviceId: string;
  initialPrompt: string | null;
}

export function AIPromptEditor({ deviceId, initialPrompt }: AIPromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [savedPrompt, setSavedPrompt] = useState(initialPrompt || '');
  const [saving, setSaving] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = PROMPT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setPrompt(template.prompt);
    }
  };

  useEffect(() => {
    setPrompt(initialPrompt || '');
    setSavedPrompt(initialPrompt || '');
  }, [initialPrompt]);

  const hasChanges = prompt !== savedPrompt;

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('devices')
        .update({ ai_prompt: prompt || null } as any)
        .eq('id', deviceId);

      if (error) throw error;

      setSavedPrompt(prompt);
      toast.success('Prompt de IA atualizado com sucesso!', {
        description: 'O totem receberá o novo prompt no próximo heartbeat.',
      });
    } catch (error) {
      console.error('Erro ao salvar prompt:', error);
      toast.error('Erro ao salvar o prompt de IA');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPrompt(savedPrompt);
  };

  return (
    <Card className="card-industrial">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Prompt de IA
        </CardTitle>
        <CardDescription>
          Configure o comportamento da IA para este dispositivo específico. Cada totem pode ter seu próprio prompt personalizado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Select onValueChange={handleTemplateSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Usar um template pronto como base..." />
            </SelectTrigger>
            <SelectContent>
              {PROMPT_TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Você é um assistente virtual da loja X. Responda de forma educada e ajude os clientes com informações sobre produtos, horários e promoções..."
          className="min-h-[160px] resize-y font-mono text-sm"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {prompt.length} caracteres
            {hasChanges && (
              <span className="text-warning ml-2">• Alterações não salvas</span>
            )}
          </p>
          <div className="flex gap-2">
            {hasChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={saving}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Descartar
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              <Save className="w-4 h-4 mr-1" />
              {saving ? 'Salvando...' : 'Salvar Prompt'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
