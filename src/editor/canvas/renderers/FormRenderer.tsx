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
  successMessage?: string;
  navigateOnSubmit?: string;
  navigateTransition?: string;
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
    successMessage = 'Enviado com sucesso! ✅',
    navigateOnSubmit,
    navigateTransition = 'fade',
  } = props;

  const { setVariables, navigateToPage } = usePageVariables();
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
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

    if (Object.keys(vars).length > 0) {
      setVariables(vars);
    }

    if (navigateOnSubmit && navigateToPage) {
      navigateToPage(navigateOnSubmit, navigateTransition as any, vars);
    } else {
      setSubmitted(true);
    }
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

  const fieldStyle = {
    background: `linear-gradient(135deg, ${fieldBgColor}, rgba(255,255,255,0.04))`,
    color: fieldTextColor,
    border: '1px solid rgba(255,255,255,0.08)',
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

      <div className="space-y-4 flex-1">
        {fields.map((field) => {
          const varName = field.variableName || field.label.toLowerCase().replace(/\s+/g, '_');
          return (
            <div key={field.id} className="space-y-1.5">
              <label className="text-[11px] font-semibold flex items-center gap-1" style={{ color: `${fieldTextColor}88`, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                {field.label}
                {field.required && <span style={{ color: '#ef4444' }}>*</span>}
              </label>

              {(field.type === 'text' || field.type === 'email' || field.type === 'phone') && (
                <input
                  type={field.type === 'phone' ? 'tel' : field.type}
                  placeholder={field.placeholder || ''}
                  data-var={varName}
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none focus:ring-1"
                  style={{ ...fieldStyle, focusRingColor: accentColor } as any}
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
                  <option value="">{field.placeholder || 'Selecione...'}</option>
                  {(field.options || '').split(',').filter(Boolean).map((opt) => (
                    <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
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

      <button
        onClick={handleSubmit}
        className="w-full h-13 rounded-2xl font-bold text-base mt-5 shrink-0 transition-all active:scale-[0.98] relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${submitBgColor}, ${submitBgColor}dd)`,
          color: submitTextColor,
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: `0 4px 24px ${submitBgColor}40`,
          padding: '14px 24px',
        }}
      >
        {/* Button shine */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
          borderRadius: '16px 16px 0 0',
          pointerEvents: 'none',
        }} />
        <span style={{ position: 'relative' }}>{submitLabel}</span>
      </button>
    </div>
  );
}
