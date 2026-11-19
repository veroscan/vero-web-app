'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { asApiError, isRedirecting, type ApiError } from './api';

export interface Resource<T> {
  data: T | undefined;
  error: ApiError | undefined;
  loading: boolean;
  reload: () => void;
  set: (value: T) => void;
}

/** One API read for a screen, with its loading and error states. A newer call always wins. */
export function useResource<T>(load: () => Promise<T>, deps: readonly unknown[]): Resource<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<ApiError>();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const latest = useRef(load);
  latest.current = load;

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(undefined);
    latest.current().then(
      (value) => {
        if (!current) return;
        setData(value);
        setLoading(false);
      },
      (failure: unknown) => {
        if (!current) return;
        // Being sent to sign in: stay on the loading state rather than flash an error.
        if (isRedirecting(failure)) return;
        setError(asApiError(failure));
        setLoading(false);
      },
    );
    return () => {
      current = false;
    };
    // The caller lists what the read depends on.
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  return { data, error, loading, reload, set: setData };
}
