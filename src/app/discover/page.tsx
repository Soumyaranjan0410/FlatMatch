"use client";

import { AppFrame } from "@/components/shell";
import { SwipeDeck } from "@/components/swipe-deck";
import { useSession } from "@/lib/session-client";

export default function DiscoverPage() {
  const { state } = useSession();
  return (
    <AppFrame allow="app">
      {state.status === "app" ? <SwipeDeck me={state.user} /> : null}
    </AppFrame>
  );
}
