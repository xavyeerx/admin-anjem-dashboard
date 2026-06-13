"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => void;
}

/** Generic GET hook — loading hanya saat fetch pertama, refetch tidak kosongkan tabel */
export function useApi<T>(url: string, deps: unknown[] = []): UseApiState<T> {
  const [data, setData]           = useState<T | null>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [tick, setTick]           = useState(0);
  const hasLoaded = useRef(false);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    if (!hasLoaded.current) setLoading(true);
    else setRefreshing(true);
    setError(null);

    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) {
          setError(json.error);
        } else {
          setData(json.data);
          hasLoaded.current = true;
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, tick, ...deps]);

  return { data, loading, refreshing, error, refetch };
}

/** POST / PUT / DELETE helper */
export async function apiMutate<T>(
  url: string,
  method: "POST" | "PUT" | "DELETE" | "PATCH",
  body?: unknown,
): Promise<{ data: T | null; error: string | null }> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}
