import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getGuidance } from '../services/api';
import { demoGuidance } from '../services/demo';

const cache = new Map(); // live-mode cache: disease -> guidance|null

/**
 * Loads guidance for a disease label.
 * state: 'idle' | 'loading' | 'ready' | 'missing' | 'error'
 */
export function useGuidance(disease, { enabled = true } = {}) {
  const { demoMode } = useApp();
  const [state, setState] = useState({ status: 'idle', data: null, error: null });

  useEffect(() => {
    if (!enabled || !disease) {
      setState({ status: 'idle', data: null, error: null });
      return undefined;
    }
    if (!demoMode && cache.has(disease)) {
      const data = cache.get(disease);
      setState({ status: data ? 'ready' : 'missing', data, error: null });
      return undefined;
    }
    const ctrl = new AbortController();
    setState({ status: 'loading', data: null, error: null });
    (demoMode ? demoGuidance(disease) : getGuidance(disease, { signal: ctrl.signal }))
      .then((data) => {
        if (!demoMode) cache.set(disease, data);
        setState({ status: data ? 'ready' : 'missing', data, error: null });
      })
      .catch((error) => {
        if (error.kind === 'aborted') return;
        setState({ status: 'error', data: null, error });
      });
    return () => ctrl.abort();
  }, [disease, enabled, demoMode]);

  return state;
}
