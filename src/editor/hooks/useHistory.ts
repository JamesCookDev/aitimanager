import { useState, useCallback } from 'react';
import type { CanvasState } from '../types/canvas';

const MAX_HISTORY = 40;

export function useHistory(initialState: CanvasState) {
  const [past, setPast] = useState<CanvasState[]>([]);
  const [present, setPresent] = useState(initialState);
  const [future, setFuture] = useState<CanvasState[]>([]);

  const push = useCallback((next: CanvasState) => {
    setPast(p => [...p.slice(-MAX_HISTORY), present]);
    setPresent(next);
    setFuture([]);
  }, [present]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    setFuture(f => [present, ...f]);
    const prev = past[past.length - 1];
    setPast(p => p.slice(0, -1));
    setPresent(prev);
  }, [past, present]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    setPast(p => [...p, present]);
    const next = future[0];
    setFuture(f => f.slice(1));
    setPresent(next);
  }, [future, present]);

  const load = useCallback((s: CanvasState) => {
    setPast([]);
    setFuture([]);
    setPresent(s);
  }, []);

  return { state: present, push, undo, redo, load, canUndo: past.length > 0, canRedo: future.length > 0 };
}
