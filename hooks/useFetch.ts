"use client";

import React from "react";

export type UseFetchOptions = RequestInit & {
  auto?: boolean;
};

export function useFetch<TResponse = unknown>(
  input: string | URL | Request,
  init?: UseFetchOptions
) {
  const [data, setData] = React.useState<TResponse | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState(false);
  const controllerRef = React.useRef<AbortController | null>(null);

  const execute = React.useCallback(
    async (overrideInit?: RequestInit) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);
      setError(null);
      setData(null); // Clear previous data before new request
      try {
        const res = await fetch(input, {
          ...init,
          ...overrideInit,
          signal: controller.signal,
        });
        const contentType = res.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        const body = (isJson ? await res.json() : await res.text()) as unknown as TResponse;
        if (!res.ok) {
          const message = isJson && body && (body as any).error
            ? (body as any).error
            : typeof body === "string"
              ? body
              : "Request failed";
          const err = new Error(`${res.status} ${res.statusText}: ${message}`);
          setError(err);
          setData(null);
          return { ok: false as const, error: err, data: null as TResponse | null };
        }
        setData(body as TResponse);
        return { ok: true as const, data: body as TResponse, error: null };
      } catch (e) {
        const err = e instanceof Error ? e : new Error("Network error");
        setError(err);
        setData(null);
        return { ok: false as const, error: err, data: null as TResponse | null };
      } finally {
        setLoading(false);
      }
    },
    [input, init]
  );

  React.useEffect(() => {
    if (init?.auto) {
      void execute();
    }
    return () => {
      controllerRef.current?.abort();
    };
  }, [execute, init?.auto]);

  const reset = React.useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    controllerRef.current?.abort();
  }, []);

  return { data, error, loading, execute, reset } as const;
}


