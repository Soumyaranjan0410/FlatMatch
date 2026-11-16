"use client";

import { useCallback, useEffect, useState } from "react";
import type { Me } from "./types";

export type SessionState =
  | { status: "loading" }
  | { status: "anon" }
  | { status: "onboarding"; phone: string; email: string; user: Me | null }
  | { status: "app"; user: Me };

let memory: SessionState | null = null;
const listeners = new Set<(state: SessionState) => void>();

async function fetchSession(): Promise<SessionState> {
  const res = await fetch("/api/me");
  if (res.status === 401) return { status: "anon" };
  const data = await res.json().catch(() => null);
  if (!data) return { status: "anon" };
  if (data.stage === "app") return { status: "app", user: data.user };
  return {
    status: "onboarding",
    phone: data.phone || "",
    email: data.email || "",
    user: data.user || null,
  };
}

function publish(state: SessionState) {
  memory = state;
  listeners.forEach((listener) => listener(state));
}

export function useSession() {
  const [state, setState] = useState<SessionState>(memory ?? { status: "loading" });

  useEffect(() => {
    listeners.add(setState);
    if (!memory) {
      fetchSession()
        .then(publish)
        .catch(() => publish({ status: "anon" }));
    } else {
      setState(memory);
    }
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const refresh = useCallback(async () => {
    const next = await fetchSession();
    publish(next);
    return next;
  }, []);

  return { state, refresh };
}

export function clearSessionMemory() {
  memory = null;
}
