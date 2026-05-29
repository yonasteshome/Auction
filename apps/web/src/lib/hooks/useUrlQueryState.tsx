"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useUrlQueryState(key: string, defaultValue: string) {
  const router = useRouter();
  const [value, setValue] = useState<string>(() => {
    if (typeof window === "undefined") return defaultValue;
    const usp = new URLSearchParams(window.location.search);
    return usp.get(key) ?? defaultValue;
  });

  useEffect(() => {
    const onPop = () => {
      const usp = new URLSearchParams(window.location.search);
      setValue(usp.get(key) ?? defaultValue);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [key, defaultValue]);

  const setQuery = useCallback(
    (next: string) => {
      const usp = new URLSearchParams(window.location.search);
      if (next === "" || next === null) {
        usp.delete(key);
      } else {
        usp.set(key, String(next));
      }
      const qs = usp.toString();
      const href = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      // use router.push to update the URL client-side
      router.push(href);
      // update local state immediately
      setValue(next);
    },
    [key, router]
  );

  return [value, setQuery] as const;
}
