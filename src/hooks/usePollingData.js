import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for polling data at regular intervals
 * @param {Function} apiCall - Async function that fetches data
 * @param {number} interval - Polling interval in milliseconds (default: 5000)
 * @param {boolean} enabled - Whether polling should be active (default: true)
 * @param {Array} dependencies - Dependencies that trigger refetch
 * @returns {Object} { data, loading, error, refetch }
 */
export const usePollingData = (apiCall, interval = 5000, enabled = true, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pollingRef = useRef(null);
  const visibilityRef = useRef(true);

  // Track page visibility to pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      visibilityRef.current = !document.hidden;

      // If page becomes visible and polling was enabled, restart polling
      if (visibilityRef.current && enabled) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled]);

  // Main fetch function
  const fetchData = async () => {
    // Only fetch if page is visible
    if (!visibilityRef.current) return;

    try {
      setError(null);
      const result = await apiCall();
      setData(result);
      setLoading(false);
    } catch (err) {
      console.error('Polling error:', err);
      setError(err.message || 'Failed to fetch data');
      setLoading(false);
    }
  };

  // Setup polling interval
  useEffect(() => {
    if (!enabled) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      return;
    }

    // Initial fetch
    fetchData();

    // Setup polling interval
    pollingRef.current = setInterval(() => {
      if (visibilityRef.current) {
        fetchData();
      }
    }, interval);

    // Cleanup on unmount or when enabled changes
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [interval, enabled, ...dependencies]);

  // Refetch function for manual refresh
  const refetch = () => {
    setLoading(true);
    fetchData();
  };

  return { data, loading, error, refetch };
};

export default usePollingData;
