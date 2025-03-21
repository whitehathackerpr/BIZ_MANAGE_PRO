import { useState, useEffect } from 'react';

const useFetch = (apiFunction, params = {}, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    onSuccess,
    onError,
    enabled = true,
    refetchInterval = null,
  } = options;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(params);
      setData(response);
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, JSON.stringify(params)]);

  useEffect(() => {
    let interval;
    if (refetchInterval && enabled) {
      interval = setInterval(fetchData, refetchInterval);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [refetchInterval, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useFetch; 