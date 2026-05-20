import { useState, useEffect, useCallback, useRef } from 'react';
import { catalogApi } from '../api/services';
import { pickCurrentYear } from '../utils/academicYear';

/** In-memory cache: gradeId -> sections[] (shared across hook instances in same session) */
const sectionsCache = new Map();
const inflightSections = new Map();

export function invalidateSectionsCache(gradeId) {
  if (gradeId) sectionsCache.delete(gradeId);
  else sectionsCache.clear();
}

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
  const [currentYear, setCurrentYear] = useState(null);
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
    sectionsCache.clear();
    setLoading(true);
    setError(null);
    try {
      const [yRes, curRes, gRes, sRes] = await Promise.allSettled([
        catalogApi.getYears(),
        catalogApi.getCurrentYear(),
        catalogApi.getGrades(),
        catalogApi.getSubjects(),
      ]);

      if (!mountedRef.current) return;

      if (yRes.status === 'fulfilled') {
        const list = yRes.value.data.data || [];
        setYears(list);
        const fromApi = curRes.status === 'fulfilled' ? curRes.value.data.data : null;
        setCurrentYear(fromApi || pickCurrentYear(list));
      } else {
        setError(yRes.reason?.response?.data?.message || 'Failed to load academic years');
        if (curRes.status === 'fulfilled') setCurrentYear(curRes.value.data.data);
      }

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

  const refreshCatalog = useCallback(async () => {
    invalidateSectionsCache();
    await loadCatalog();
  }, [loadCatalog]);

  return {
    years,
    currentYear,
    grades,
    subjects,
    pickCurrentYear,
    loading,
    error,
    loadCatalog,
    refreshCatalog,
    loadTerms,
    loadSections,
    invalidateSectionsCache,
  };
}
