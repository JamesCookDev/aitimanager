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
  variableName?: string; // global variable name to write on submit
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
  navigateOnSubmit?: string; // page ID to navigate to after submit
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
    fieldBgColor = 'rgba(255,255,255,0.1)',
    fieldTextColor = '#ffffff',
    successMessage = 'Enviado com sucesso! ✅',
    navigateOnSubmit,
    navigateTransition = 'fade',
  } = props;

  const { setVariables, navigateToPage } = usePageVariables();
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    // Collect values from inputs and write to global variables
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
      <div className="w-full h-full flex items-center justify-center" style={{ background: bgColor, borderRadius }}>
        <div className="text-center space-y-3">
          <span className="text-4xl">✅</span>
          <p className="text-white font-semibold text-lg">{successMessage}</p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-xs underline"
            style={{ color: accentColor }}
          >
            Enviar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={formRef} className="w-full h-full overflow-auto flex flex-col" style={{ background: bgColor, borderRadius, padding: 20 }}>
      <h2 className="font-bold mb-4 shrink-0" style={{ color: titleColor, fontSize: titleSize }}>{title}</h2>

      <div className="space-y-3 flex-1">
        {fields.map((field) => {
          const varName = field.variableName || field.label.toLowerCase().replace(/\s+/g, '_');
          return (
            <div key={field.id} className="space-y-1">
              <label className="text-[11px] font-medium flex items-center gap-1" style={{ color: `${fieldTextColor}99` }}>
                {field.label}
                {field.required && <span style={{ color: '#ef4444' }}>*</span>}
              </label>

              {(field.type === 'text' || field.type === 'email' || field.type === 'phone') && (
                <input
                  type={field.type === 'phone' ? 'tel' : field.type}
                  placeholder={field.placeholder || ''}
                  data-var={varName}
                  className="w-full h-10 px-3 rounded-lg text-sm outline-none border border-white/10"
                  style={{ background: fieldBgColor, color: fieldTextColor }}
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  placeholder={field.placeholder || ''}
                  rows={3}
                  data-var={varName}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none border border-white/10"
                  style={{ background: fieldBgColor, color: fieldTextColor }}
                />
              )}

              {field.type === 'select' && (
                <select
                  data-var={varName}
                  className="w-full h-10 px-3 rounded-lg text-sm outline-none border border-white/10"
                  style={{ background: fieldBgColor, color: fieldTextColor }}
                >
                  <option value="">{field.placeholder || 'Selecione...'}</option>
                  {(field.options || '').split(',').filter(Boolean).map((opt) => (
                    <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                  ))}
                </select>
              )}

              {field.type === 'checkbox' && (
                <label className="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="checkbox" data-var={varName} className="sr-only peer" />
                  <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center peer-checked:bg-primary/80 transition-colors" style={{ background: fieldBgColor }}>
                    <CheckSquare className="w-4 h-4 text-white peer-checked:opacity-100 opacity-0" />
                  </div>
                  <span className="text-xs" style={{ color: fieldTextColor }}>{field.placeholder || field.label}</span>
                </label>
              )}

              {varName && (
                <span className="text-[8px] text-white/20 font-mono">→ {'{{' + varName + '}}'}</span>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full h-12 rounded-xl font-bold text-base mt-4 shrink-0 transition-transform active:scale-95"
        style={{ background: submitBgColor, color: submitTextColor }}
      >
        {submitLabel}
      </button>
    </div>
  );
}
