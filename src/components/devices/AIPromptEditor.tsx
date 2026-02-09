import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Brain, Save, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIPromptEditorProps {
  deviceId: string;
  initialPrompt: string | null;
}

export function AIPromptEditor({ deviceId, initialPrompt }: AIPromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [savedPrompt, setSavedPrompt] = useState(initialPrompt || '');
  const [saving, setSaving] = useState(false);

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
