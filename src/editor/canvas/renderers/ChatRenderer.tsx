import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send } from 'lucide-react';

export function ChatPlaceholder(props: any) {
  const placeholder = props.placeholder || 'Pergunte algo...';
  const theme = props.theme || 'dark';
  const isDark = theme === 'dark';
  const accentColor = props.accentColor || '#6366f1';
  const borderRadius = props.borderRadius || 16;
  const bgMain = isDark ? 'rgba(10,15,30,0.95)' : 'rgba(255,255,255,0.95)';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const bubbleBgUser = accentColor;
  const bubbleBgBot = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

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
    <div className="w-full h-full flex flex-col overflow-hidden" style={{
      background: bgMain,
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      borderRadius,
      backdropFilter: 'blur(16px)',
    }}>
      <style>{`
        @keyframes chat-typing { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        .chat-dot { animation: chat-typing 1.4s ease-in-out infinite; }
        .chat-dot:nth-child(2) { animation-delay: 0.2s; }
        .chat-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {/* Header */}
      <div className="flex-shrink-0 px-4 py-2.5 flex items-center gap-2.5" style={{
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#22c55e',
          boxShadow: '0 0 8px rgba(34,197,94,0.5)',
        }} />
        <span style={{ color: textColor, fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>Chat IA</span>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="ml-auto text-[10px] px-2 py-0.5 rounded-full transition-colors" style={{
            color: mutedColor, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>Limpar</button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5" style={{ scrollbarWidth: 'thin' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageSquare className="w-6 h-6" style={{ color: accentColor }} />
            </div>
            <span style={{ color: mutedColor, fontSize: 12, fontWeight: 500 }}>Envie uma mensagem para começar</span>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="flex" style={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%',
              padding: '8px 12px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user'
                ? `linear-gradient(135deg, ${bubbleBgUser}, ${bubbleBgUser}dd)`
                : bubbleBgBot,
              color: msg.role === 'user' ? '#fff' : textColor,
              fontSize: 12,
              lineHeight: 1.55,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              boxShadow: msg.role === 'user'
                ? `0 2px 12px ${accentColor}30`
                : '0 1px 4px rgba(0,0,0,0.1)',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div style={{
              padding: '10px 16px', borderRadius: '14px 14px 14px 4px',
              background: bubbleBgBot,
              display: 'flex', gap: 4, alignItems: 'center',
            }}>
              <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor }} />
              <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor }} />
              <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-3 pb-3 pt-1.5 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={placeholder}
          className="flex-1 h-9 rounded-xl border-none outline-none px-4 text-xs"
          style={{
            background: inputBg, color: textColor, fontSize: 12,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: loading || !input.trim()
              ? 'rgba(255,255,255,0.05)'
              : `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
            color: '#fff',
            border: 'none',
            cursor: loading || !input.trim() ? 'default' : 'pointer',
            opacity: loading || !input.trim() ? 0.4 : 1,
            boxShadow: !loading && input.trim() ? `0 2px 12px ${accentColor}40` : 'none',
          }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
