import { useEffect, useState } from 'react';
import { platformApi } from '../../api/services';

export function usePlatformSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platformApi.listSchools({ limit: 500 })
      .then((res) => setSchools(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => setSchools([]))
      .finally(() => setLoading(false));
  }, []);

  return { schools, loading };
}
