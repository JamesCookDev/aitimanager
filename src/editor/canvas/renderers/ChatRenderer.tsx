import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';

export function ChatPlaceholder(props: any) {
  const placeholder = props.placeholder || 'Pergunte algo...';
  const theme = props.theme || 'dark';
  const isDark = theme === 'dark';
  const accentColor = props.accentColor || '#6366f1';
  const borderRadius = props.borderRadius || 16;
  const bgMain = isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const inputBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const bubbleBgUser = accentColor;
  const bubbleBgBot = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  type Msg = { role: 'user' | 'assistant'; content: string };
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Msg = { role: 'user', content: text };
    setMessages(prev => {
      const newMsgs = [...prev, userMsg];
      doStream(newMsgs);
      return newMsgs;
    });

    async function doStream(allMsgs: Msg[]) {
      setLoading(true);
      let assistantSoFar = '';
      try {
        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/totem-chat`;
        const resp = await fetch(CHAT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: allMsgs }),
        });

        if (!resp.ok || !resp.body) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || 'Falha na conexão');
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = '';
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') { streamDone = true; break; }
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantSoFar += content;
                const snapshot = assistantSoFar;
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'assistant') {
                    return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: snapshot } : m);
                  }
                  return [...prev, { role: 'assistant', content: snapshot }];
                });
              }
            } catch {
              textBuffer = line + '\n' + textBuffer;
              break;
            }
          }
        }
      } catch (err: any) {
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${err.message || 'Erro desconhecido'}` }]);
      } finally {
        setLoading(false);
      }
    }
  }, [input, loading]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: bgMain, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius }}>
      {/* Header */}
      <div className="flex-shrink-0 px-3 py-2 flex items-center gap-2 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span style={{ color: textColor, fontSize: 12, fontWeight: 600 }}>Chat IA</span>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="ml-auto text-[10px]" style={{ color: mutedColor, background: 'none', border: 'none', cursor: 'pointer' }}>Limpar</button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2" style={{ scrollbarWidth: 'thin' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <MessageSquare className="w-8 h-8" style={{ color: mutedColor }} />
            <span style={{ color: mutedColor, fontSize: 11 }}>Envie uma mensagem para começar</span>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="flex" style={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              padding: '6px 10px',
              borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: msg.role === 'user' ? bubbleBgUser : bubbleBgBot,
              color: msg.role === 'user' ? '#fff' : textColor,
              fontSize: 11,
              lineHeight: 1.5,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div style={{ padding: '6px 10px', borderRadius: '12px 12px 12px 2px', background: bubbleBgBot, color: mutedColor, fontSize: 11 }}>
              <span className="animate-pulse">●●●</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-2 pb-2 pt-1 flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={placeholder}
          className="flex-1 h-8 rounded-lg border-none outline-none px-3 text-xs"
          style={{ background: inputBg, color: textColor, fontSize: 11 }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-opacity"
          style={{
            background: bubbleBgUser,
            color: '#fff',
            border: 'none',
            cursor: loading || !input.trim() ? 'default' : 'pointer',
            opacity: loading || !input.trim() ? 0.4 : 1,
          }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
