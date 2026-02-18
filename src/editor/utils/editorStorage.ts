const STORAGE_KEY = 'aitinet-page-editor-state';

export function saveEditorState(json: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.warn('Failed to save editor state', e);
  }
}

export function loadEditorState(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function exportEditorJson(json: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `page-layout-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importEditorJson(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return reject(new Error('No file selected'));
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    };
    input.click();
  });
}
