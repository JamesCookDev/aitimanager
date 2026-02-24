import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import type { PageTransition } from '../types/canvas';

interface PageVariablesContextType {
  /** Global variables shared across all pages */
  variables: Record<string, string>;
  /** Set a single variable */
  setVariable: (key: string, value: string) => void;
  /** Set multiple variables at once */
  setVariables: (vars: Record<string, string>) => void;
  /** Clear all variables */
  clearVariables: () => void;
  /** Navigate to page (with optional context data written to variables) */
  navigateToPage?: (targetViewId: string, transition?: PageTransition, contextVars?: Record<string, string>) => void;
}

const PageVariablesContext = createContext<PageVariablesContextType>({
  variables: {},
  setVariable: () => {},
  setVariables: () => {},
  clearVariables: () => {},
});

export function usePageVariables() {
  return useContext(PageVariablesContext);
}

interface ProviderProps {
  children: ReactNode;
  navigateToPage?: (targetViewId: string, transition?: PageTransition, contextVars?: Record<string, string>) => void;
}

export function PageVariablesProvider({ children, navigateToPage }: ProviderProps) {
  const [variables, setVarsState] = useState<Record<string, string>>({});

  const setVariable = useCallback((key: string, value: string) => {
    setVarsState(prev => ({ ...prev, [key]: value }));
  }, []);

  const setVariables = useCallback((vars: Record<string, string>) => {
    setVarsState(prev => ({ ...prev, ...vars }));
  }, []);

  const clearVariables = useCallback(() => {
    setVarsState({});
  }, []);

  const navigateWithContext = useCallback((targetViewId: string, transition?: PageTransition, contextVars?: Record<string, string>) => {
    if (contextVars) {
      setVarsState(prev => ({ ...prev, ...contextVars }));
    }
    navigateToPage?.(targetViewId, transition);
  }, [navigateToPage]);

  return (
    <PageVariablesContext.Provider value={{ variables, setVariable, setVariables, clearVariables, navigateToPage: navigateWithContext }}>
      {children}
    </PageVariablesContext.Provider>
  );
}

/** Interpolate {{variableName}} in text with global variables */
export function interpolateVariables(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] !== undefined ? variables[varName] : match;
  });
}
