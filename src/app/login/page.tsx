"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { AppFrame, Splash } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/client";
import { useSession } from "@/lib/session-client";

function LoginForm() {
  const params = useSearchParams();
  const emailMode = params.get("method") === "email";
  const router = useRouter();
  const { refresh } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    setBusy(true);
    try {
      const data = await api<{ hint: string }>("/api/auth/otp", {
        method: "POST",
        body: JSON.stringify({ identifier }),
      });
      setHint(data.hint);
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't send a code.");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    try {
      const data = await api<{ next: string }>("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ identifier, code }),
      });
      await refresh();
      router.push(data.next === "discover" ? "/discover" : "/onboarding");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "That code didn't work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppFrame allow="guest">
      <main className="flex flex-1 flex-col px-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <button type="button" className="w-fit text-sm text-muted-foreground" onClick={() => router.push("/")}>
          Back
        </button>
        <h1 className="mt-6 font-display text-4xl tracking-tight">
          {sent ? "Enter the code" : emailMode ? "What's your email?" : "What's your number?"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {emailMode
            ? "We'll pretend to email a code. In this demo it is always 123456."
            : "Indian mobile, starting 6–9. No SMS is sent. The demo code is 123456."}
        </p>
        {sent ? (
          <div className="mt-8 grid gap-3">
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
              className="h-14 rounded-2xl text-center text-2xl tracking-[0.4em]"
            />
            <p className="rounded-2xl bg-[#F8EFE2] px-3 py-2 text-sm text-[#6d4810]">{hint}</p>
            <Button size="xl" disabled={busy || code.trim().length < 4} onClick={verify}>
              {busy ? "Checking…" : "Continue"}
            </Button>
            <button type="button" className="text-sm text-muted-foreground" onClick={() => setSent(false)}>
              Use a different {emailMode ? "email" : "number"}
            </button>
          </div>
        ) : (
          <form
            className="mt-8 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void sendCode();
            }}
          >
            {emailMode ? (
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@college.edu"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="h-14 rounded-2xl px-4 text-lg"
              />
            ) : (
              <div className="flex h-14 items-center rounded-2xl border bg-card px-3">
                <span className="pr-3 text-base text-muted-foreground">+91</span>
                <input
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="98450 01001"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  className="h-full w-full bg-transparent text-lg outline-none"
                />
              </div>
            )}
            <Button size="xl" type="submit" disabled={busy || identifier.trim().length < 4}>
              {busy ? "Sending…" : "Send code"}
            </Button>
            <button
              type="button"
              className="text-sm text-primary"
              onClick={() => router.push(emailMode ? "/login" : "/login?method=email")}
            >
              {emailMode ? "Use a phone number" : "Use email instead"}
            </button>
          </form>
        )}
      </main>
    </AppFrame>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Splash />}>
      <LoginForm />
    </Suspense>
  );
}
