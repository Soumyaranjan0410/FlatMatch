"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { NoBrokerBadge, VerifiedBadge, optionLabel } from "@/components/bits";
import { AppFrame, forgetSession } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DEMO_ACCOUNTS, DIETS, SCHEDULES } from "@/lib/constants";
import { api } from "@/lib/client";
import { inr, phoneLabel, prettyDate } from "@/lib/format";
import { useSession } from "@/lib/session-client";
import type { Me } from "@/lib/types";

export default function ProfilePage() {
  const { state, refresh } = useSession();
  const router = useRouter();
  const me = state.status === "app" ? state.user : null;
  const [bio, setBio] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(partial: Partial<Me>) {
    if (!me) return;
    setBusy(true);
    try {
      await api("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ ...me, ...partial, bio: bio ?? me.bio }),
      });
      await refresh();
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    forgetSession();
    router.push("/");
    await refresh();
  }

  async function demo(loginId: string) {
    try {
      await api("/api/auth/demo", { method: "POST", body: JSON.stringify({ loginId }) });
      forgetSession();
      await refresh();
      router.push("/discover");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't switch.");
    }
  }

  return (
    <AppFrame allow="app">
      {me ? (
        <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-6">
          <div className="flex items-center gap-4">
            <img src={me.photo} alt="" className="size-20 rounded-full object-cover" />
            <div>
              <h1 className="font-display text-3xl tracking-tight">{me.name}</h1>
              <p className="text-sm text-muted-foreground">
                {me.age} · {me.area}, {me.city}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {me.verified ? <VerifiedBadge /> : null}
                {me.noBrokers ? <NoBrokerBadge /> : null}
                {me.womenOnly ? <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">Women only</span> : null}
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm">{me.occupation}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {inr(me.budgetMin)}–{inr(me.budgetMax)} · moving {prettyDate(me.moveInDate)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {optionLabel(DIETS, me.diet)} · {optionLabel(SCHEDULES, me.schedule)} · {me.languages.join(", ")}
          </p>
          {me.phone ? <p className="mt-1 text-sm text-muted-foreground">{phoneLabel(me.phone)}</p> : null}
          {me.email ? <p className="text-sm text-muted-foreground">{me.email}</p> : null}

          <label className="mt-5 block text-sm font-medium">
            About you
            <Textarea value={bio ?? me.bio} onChange={(event) => setBio(event.target.value)} className="mt-2 min-h-28 rounded-2xl text-base" />
          </label>
          <Button className="mt-3" size="xl" disabled={busy} onClick={() => save({})}>Save bio</Button>

          {me.gender === "woman" ? (
            <label className="mt-4 flex items-start gap-3 rounded-2xl border p-3 text-sm">
              <input
                type="checkbox"
                checked={me.womenOnly}
                onChange={(event) => save({ womenOnly: event.target.checked })}
              />
              <span>
                <span className="font-medium">Women-only mode. </span>
                You only see women, and only women see you.
              </span>
            </label>
          ) : null}
          <label className="mt-3 flex items-start gap-3 rounded-2xl border p-3 text-sm">
            <input type="checkbox" checked={me.noBrokers} onChange={(event) => save({ noBrokers: event.target.checked })} />
            <span>
              <span className="font-medium">No-brokers pledge. </span>
              I'm not charging brokerage. People can still report me if I break it.
            </span>
          </label>

          <div className="mt-4 grid gap-2">
            <Link href="/verify" className="flex h-12 items-center justify-center rounded-full bg-[#1F6B4A] px-4 text-sm font-medium text-white">
              {me.verified ? "Verified · view the mock check" : "Get the verified badge"}
            </Link>
            <Link href="/list" className="flex h-12 items-center justify-center rounded-full border px-4 text-sm font-medium">
              {me.listingCount ? `Your room${me.listingCount > 1 ? "s" : ""}` : "List a room"}
            </Link>
          </div>

          <section className="mt-6">
            <h2 className="text-sm font-medium">Preview a demo profile</h2>
            <div className="mt-2 grid gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button key={account.loginId} type="button" onClick={() => demo(account.loginId)} className="rounded-2xl bg-muted px-3 py-2 text-left text-sm">
                  <span className="font-medium">{account.name}</span>
                  <span className="text-muted-foreground"> · {account.city} · {account.blurb}</span>
                </button>
              ))}
            </div>
          </section>
          <Button variant="ghost" className="mt-4 w-full" onClick={() => void logout()}>Log out</Button>
        </main>
      ) : null}
    </AppFrame>
  );
}
