import { useState, useRef } from 'react';
import { CheckSquare } from 'lucide-react';
import { usePageVariables } from '../PageVariablesContext';

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
  title?: string;
  titleColor?: string;
  titleSize?: number;
  bgColor?: string;
  borderRadius?: number;
  fields?: FormField[];
  submitLabel?: string;
  submitBgColor?: string;
  submitTextColor?: string;
  accentColor?: string;
  fieldBgColor?: string;
  fieldTextColor?: string;
  fieldLabelColor?: string;
  successMessage?: string;
  navigateOnSubmit?: string;
  navigateTransition?: string;
  dataDestination?: string;
  webhookUrl?: string;
  webhookMethod?: string;
  webhookHeaders?: string;
  emailTo?: string;
  emailSubject?: string;
  whatsappNumber?: string;
  whatsappTemplate?: string;
  showLgpdConsent?: boolean;
  lgpdText?: string;
  requireConsent?: boolean;
}

export function FormRenderer(props: Props) {
  const {
    title = 'Check-in',
    titleColor = '#ffffff',
    titleSize = 22,
    bgColor = 'rgba(0,0,0,0.5)',
    borderRadius = 16,
    fields = [],
    submitLabel = 'Enviar',
    submitBgColor = '#6366f1',
    submitTextColor = '#ffffff',
    accentColor = '#6366f1',
    fieldBgColor = 'rgba(255,255,255,0.08)',
    fieldTextColor = '#ffffff',
    fieldLabelColor,
    successMessage = 'Enviado com sucesso! ✅',
    navigateOnSubmit,
    navigateTransition = 'fade',
    dataDestination = 'none',
    webhookUrl,
    webhookMethod,
    webhookHeaders,
    whatsappNumber,
    whatsappTemplate,
    showLgpdConsent,
    lgpdText = 'Ao enviar, você concorda com nossa Política de Privacidade.',
    requireConsent,
  } = props;

  const { setVariables, navigateToPage } = usePageVariables();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Derive label color: use explicit prop, or contrast-safe fallback
  const labelColor = fieldLabelColor || (fieldTextColor ? `${fieldTextColor}99` : 'rgba(200,200,200,0.8)');

  const collectFormData = (): Record<string, string> => {
    const vars: Record<string, string> = {};
    if (formRef.current) {
      const inputs = formRef.current.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-var]');
      inputs.forEach(input => {
        const varName = input.getAttribute('data-var');
        if (varName) {
          if (input.type === 'checkbox') {
            vars[varName] = (input as HTMLInputElement).checked ? 'sim' : 'não';
          } else {
            vars[varName] = input.value;
          }
        }
      });
    }
    return vars;
  };

  const sendData = async (data: Record<string, string>) => {
    if (dataDestination === 'none') return;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (dataDestination === 'database' || dataDestination === 'webhook') {
      try {
        await fetch(`${supabaseUrl}/functions/v1/form-submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
          },
          body: JSON.stringify({
            form_title: title,
            fields: data,
            webhook_url: dataDestination === 'webhook' ? webhookUrl : undefined,
            webhook_method: webhookMethod,
            webhook_headers: webhookHeaders,
          }),
        });
      } catch (e) {
        console.error('Form submit error:', e);
      }
    }

    if (dataDestination === 'whatsapp' && whatsappNumber) {
      let message = whatsappTemplate || Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
      // Interpolate {{var}} in template
      Object.entries(data).forEach(([k, v]) => {
        message = message.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
      });
      const phone = whatsappNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleSubmit = async () => {
    if (requireConsent && showLgpdConsent && !consentChecked) return;

    setSending(true);
    const vars = collectFormData();

    if (Object.keys(vars).length > 0) {
      setVariables(vars);
    }

    await sendData(vars);

    if (navigateOnSubmit && navigateToPage) {
      navigateToPage(navigateOnSubmit, navigateTransition as any, vars);
    } else {
      setSubmitted(true);
    }
    setSending(false);
  };

  if (submitted) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{
        background: `linear-gradient(160deg, ${bgColor}, rgba(0,0,0,0.65))`,
        borderRadius,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="text-center space-y-4">
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: '#22c55e18',
            border: '1px solid #22c55e30',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
          }}>
            <span className="text-4xl">✅</span>
          </div>
          <p className="font-semibold text-lg" style={{ color: titleColor }}>{successMessage}</p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-xs px-4 py-1.5 rounded-full transition-colors"
            style={{
              color: accentColor,
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
            }}
          >
            Enviar outro
          </button>
        </div>
      </div>
    );
  }

  const fieldStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${fieldBgColor}, rgba(255,255,255,0.04))`,
    color: fieldTextColor,
    border: '1px solid rgba(255,255,255,0.12)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div ref={formRef} className="w-full h-full overflow-auto flex flex-col" style={{
      background: `linear-gradient(160deg, ${bgColor}, rgba(0,0,0,0.65))`,
      borderRadius, padding: 20,
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <h2 className="font-bold mb-5 shrink-0" style={{ color: titleColor, fontSize: titleSize, letterSpacing: '-0.01em' }}>{title}</h2>

      {dataDestination && dataDestination !== 'none' && (
        <div className="mb-3 px-3 py-1.5 rounded-lg text-[10px] font-medium shrink-0" style={{
          background: `${accentColor}15`,
          color: accentColor,
          border: `1px solid ${accentColor}25`,
        }}>
          {dataDestination === 'database' && '💾 Dados salvos no banco'}
          {dataDestination === 'webhook' && '🔌 Enviando via Webhook'}
          {dataDestination === 'email' && '📧 Enviando por e-mail'}
          {dataDestination === 'whatsapp' && '💬 Enviando via WhatsApp'}
        </div>
      )}

      <div className="space-y-4 flex-1">
        {fields.map((field) => {
          const varName = field.variableName || field.label.toLowerCase().replace(/\s+/g, '_');
          return (
            <div key={field.id} className="space-y-1.5">
              <label className="text-[11px] font-semibold flex items-center gap-1" style={{
                color: labelColor,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}>
                {field.label}
                {field.required && <span style={{ color: '#ef4444' }}>*</span>}
              </label>

              {(field.type === 'text' || field.type === 'email' || field.type === 'phone') && (
                <input
                  type={field.type === 'phone' ? 'tel' : field.type}
                  placeholder={field.placeholder || ''}
                  data-var={varName}
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                  style={fieldStyle}
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  placeholder={field.placeholder || ''}
                  rows={3}
                  data-var={varName}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={fieldStyle}
                />
              )}

              {field.type === 'select' && (
                <select
                  data-var={varName}
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                  style={fieldStyle}
                >
                  <option value="" style={{ background: '#1a1a2e', color: fieldTextColor }}>{field.placeholder || 'Selecione...'}</option>
                  {(field.options || '').split(',').filter(Boolean).map((opt) => (
                    <option key={opt.trim()} value={opt.trim()} style={{ background: '#1a1a2e', color: fieldTextColor }}>{opt.trim()}</option>
                  ))}
                </select>
              )}

              {field.type === 'checkbox' && (
                <label className="flex items-center gap-3 py-2 cursor-pointer group">
                  <input type="checkbox" data-var={varName} className="sr-only peer" />
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center peer-checked:bg-opacity-80 transition-all" style={{
                    background: fieldBgColor,
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}>
                    <CheckSquare className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm" style={{ color: fieldTextColor }}>{field.placeholder || field.label}</span>
                </label>
              )}
            </div>
          );
        })}
      </div>

      {showLgpdConsent && (
        <label className="flex items-start gap-2 mt-4 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            className="mt-1 accent-current"
            style={{ accentColor }}
          />
          <span className="text-[11px] leading-tight" style={{ color: `${fieldTextColor}88` }}>
            {lgpdText}
          </span>
        </label>
      )}

      <button
        onClick={handleSubmit}
        disabled={sending || (requireConsent && showLgpdConsent && !consentChecked)}
        className="w-full rounded-2xl font-bold text-base mt-5 shrink-0 transition-all active:scale-[0.98] relative overflow-hidden disabled:opacity-50"
        style={{
          background: `linear-gradient(135deg, ${submitBgColor}, ${submitBgColor}dd)`,
          color: submitTextColor,
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: `0 4px 24px ${submitBgColor}40`,
          padding: '14px 24px',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
          borderRadius: '16px 16px 0 0',
          pointerEvents: 'none',
        }} />
        <span style={{ position: 'relative' }}>{sending ? 'Enviando...' : submitLabel}</span>
      </button>
    </div>
  );
}
