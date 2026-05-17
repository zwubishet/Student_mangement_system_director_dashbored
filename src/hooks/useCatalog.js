import { useState, useEffect, useCallback, useRef } from 'react';
import { catalogApi } from '../api/services';

/** In-memory cache: gradeId -> sections[] (shared across hook instances in same session) */
const sectionsCache = new Map();
const inflightSections = new Map();

async function fetchSectionsForGrade(gradeId) {
  if (sectionsCache.has(gradeId)) {
    return sectionsCache.get(gradeId);
  }
  if (inflightSections.has(gradeId)) {
    return inflightSections.get(gradeId);
  }

  const promise = catalogApi.getSections(gradeId).then((res) => {
    const rows = res.data.data || [];
    sectionsCache.set(gradeId, rows);
    inflightSections.delete(gradeId);
    return rows;
  }).catch((err) => {
    inflightSections.delete(gradeId);
    throw err;
  });

  inflightSections.set(gradeId, promise);
  return promise;
}

export function useCatalog() {
  const [years, setYears] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [yRes, gRes, sRes] = await Promise.allSettled([
        catalogApi.getYears(),
        catalogApi.getGrades(),
        catalogApi.getSubjects(),
      ]);

      if (!mountedRef.current) return;

      if (yRes.status === 'fulfilled') setYears(yRes.value.data.data || []);
      else setError(yRes.reason?.response?.data?.message || 'Failed to load academic years');

      if (gRes.status === 'fulfilled') setGrades(gRes.value.data.data || []);
      else setError((prev) => prev || gRes.reason?.response?.data?.message || 'Failed to load grades');

      if (sRes.status === 'fulfilled') setSubjects(sRes.value.data.data || []);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const loadTerms = useCallback(async (academicYearId) => {
    const res = await catalogApi.getTerms(academicYearId);
    return res.data.data || [];
  }, []);

  const loadSections = useCallback(async (gradeId) => {
    if (!gradeId) return [];
    return fetchSectionsForGrade(gradeId);
  }, []);

  const invalidateSectionsCache = useCallback((gradeId) => {
    if (gradeId) sectionsCache.delete(gradeId);
    else sectionsCache.clear();
  }, []);

  return {
    years,
    grades,
    subjects,
    loading,
    error,
    loadCatalog,
    loadTerms,
    loadSections,
    invalidateSectionsCache,
  };
}
