import { useCallback, useEffect, useState } from 'react';

export function useTablePreferences(storageKey, defaultColumns) {
  const [visibleKeys, setVisibleKeys] = useState(() => {
    try {
      const raw = localStorage.getItem(`${storageKey}:columns`);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return defaultColumns.map((c) => c.key);
  });

  const [savedFilters, setSavedFilters] = useState(() => {
    try {
      const raw = localStorage.getItem(`${storageKey}:filters`);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(`${storageKey}:columns`, JSON.stringify(visibleKeys));
  }, [storageKey, visibleKeys]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}:filters`, JSON.stringify(savedFilters));
  }, [storageKey, savedFilters]);

  const toggleColumn = useCallback((key) => {
    setVisibleKeys((keys) => {
      if (keys.includes(key)) {
        if (keys.length <= 1) return keys;
        return keys.filter((k) => k !== key);
      }
      return [...keys, key];
    });
  }, []);

  const saveFilter = useCallback((name, filters) => {
    setSavedFilters((list) => {
      const next = list.filter((f) => f.name !== name);
      return [...next, { name, filters, savedAt: Date.now() }];
    });
  }, []);

  const deleteFilter = useCallback((name) => {
    setSavedFilters((list) => list.filter((f) => f.name !== name));
  }, []);

  const filterColumns = useCallback(
    (columns) => columns.filter((c) => visibleKeys.includes(c.key)),
    [visibleKeys]
  );

  return { visibleKeys, toggleColumn, filterColumns, savedFilters, saveFilter, deleteFilter };
}
