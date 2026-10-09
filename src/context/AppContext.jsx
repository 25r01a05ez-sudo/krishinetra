import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { HISTORY_LIMIT } from '../config';
import { buildDemoHistory } from '../services/demo';

const AppContext = createContext(null);

const LS = {
  demo: 'krishinetra.demoMode',
  autosave: 'krishinetra.autoSave',
  live: 'krishinetra.history.v1',
  demoHistory: 'krishinetra.history.demo.v1',
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function AppProvider({ children }) {
  const [demoMode, setDemoModeState] = useState(() => readJSON(LS.demo, false) === true);
  const [autoSave, setAutoSaveState] = useState(() => readJSON(LS.autosave, true) !== false);
  const [liveHistory, setLiveHistory] = useState(() => readJSON(LS.live, []));
  const [demoHistory, setDemoHistory] = useState(() => readJSON(LS.demoHistory, []));
  const [storageWarning, setStorageWarning] = useState(false);
  // The most recent result (holds the in-memory preview URL for the Results page)
  const [currentScan, setCurrentScan] = useState(null);
  const seeded = useRef(false);

  // Seed illustrative history once when demo mode is first enabled
  useEffect(() => {
    if (demoMode && !seeded.current && demoHistory.length === 0) {
      seeded.current = true;
      const seed = buildDemoHistory();
      setDemoHistory(seed);
      writeJSON(LS.demoHistory, seed);
    }
  }, [demoMode, demoHistory.length]);

  const setDemoMode = useCallback((value) => {
    setDemoModeState(value);
    writeJSON(LS.demo, value);
    setCurrentScan(null);
  }, []);

  const setAutoSave = useCallback((value) => {
    setAutoSaveState(value);
    writeJSON(LS.autosave, value);
  }, []);

  const history = demoMode ? demoHistory : liveHistory;

  const persist = useCallback(
    (next) => {
      const trimmed = next.slice(0, HISTORY_LIMIT);
      const key = demoMode ? LS.demoHistory : LS.live;
      let ok = writeJSON(key, trimmed);
      let list = trimmed;
      // If storage is full, retry without thumbnails on older scans
      if (!ok) {
        list = trimmed.map((s, i) => (i === 0 ? s : { ...s, thumbnail: null }));
        ok = writeJSON(key, list);
      }
      setStorageWarning(!ok);
      (demoMode ? setDemoHistory : setLiveHistory)(list);
    },
    [demoMode],
  );

  const addScan = useCallback(
    (scan) => {
      const { previewUrl, ...storable } = scan; // never persist blob URLs
      const clean = {
        ...storable,
        // Large inline overlays would overflow localStorage
        overlayUrl: storable.overlayUrl && storable.overlayUrl.startsWith('data:') ? null : storable.overlayUrl,
      };
      persist([clean, ...history.filter((s) => s.id !== clean.id)]);
    },
    [history, persist],
  );

  const removeScan = useCallback((id) => persist(history.filter((s) => s.id !== id)), [history, persist]);

  const clearHistory = useCallback(() => persist([]), [persist]);

  const value = useMemo(
    () => ({
      demoMode,
      setDemoMode,
      autoSave,
      setAutoSave,
      history,
      addScan,
      removeScan,
      clearHistory,
      currentScan,
      setCurrentScan,
      storageWarning,
    }),
    [demoMode, setDemoMode, autoSave, setAutoSave, history, addScan, removeScan, clearHistory, currentScan, storageWarning],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
