"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AppFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEMO_AADHAAR, DEMO_OTP } from "@/lib/constants";
import { api } from "@/lib/client";
import { useSession } from "@/lib/session-client";

export default function VerifyPage() {
  const { state, refresh } = useSession();
  const verified = state.status === "app" && state.user.verified;
  const [number, setNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(verified ? 3 : 1);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await api("/api/verify", { method: "POST", body: JSON.stringify({ demoAadhaar: number, otp }) });
      await refresh();
      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The mock check failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppFrame allow="app">
      <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-8">
        <Link href="/profile" className="text-sm text-muted-foreground">Back to you</Link>
        <p className="mt-4 rounded-2xl bg-[#F8EFE2] px-3 py-3 text-sm leading-relaxed text-[#6d4810]">
          Mock DigiLocker-style check. Nothing is sent to UIDAI, DigiLocker or any government system. Do not type a real Aadhaar number. The only accepted demo number is 1234 1234 1234.
        </p>
        <h1 className="mt-5 font-display text-4xl tracking-tight">Get verified</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A verified badge tells flatmates you finished this demo identity step. It is not a real KYC.
        </p>
        {step === 1 ? (
          <div className="mt-6 grid gap-3">
            <label className="text-sm">
              Demo document number
              <Input value={number} onChange={(event) => setNumber(event.target.value)} placeholder="1234 1234 1234" className="mt-1 h-12 rounded-xl px-3 text-base" />
            </label>
            <Button variant="outline" className="h-11 rounded-full" onClick={() => setNumber(DEMO_AADHAAR)}>
              Fill the demo number
            </Button>
            <Button size="xl" onClick={() => {
              if (number.replace(/\s/g, "") !== DEMO_AADHAAR) {
                toast.error("Use 1234 1234 1234. Real Aadhaar numbers are refused.");
                return;
              }
              setStep(2);
            }}>
              Continue
            </Button>
          </div>
        ) : null}
        {step === 2 ? (
          <div className="mt-6 grid gap-3">
            <p className="text-sm">A pretend OTP would arrive in DigiLocker. Here it is {DEMO_OTP}.</p>
            <Input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="123456" className="h-12 rounded-xl px-3 text-center text-xl tracking-[0.3em]" />
            <Button size="xl" disabled={busy} onClick={() => void confirm()}>{busy ? "Checking…" : "Verify me"}</Button>
          </div>
        ) : null}
        {step === 3 ? (
          <div className="mt-6 rounded-3xl bg-[#E7F3EC] px-4 py-6 text-center">
            <p className="font-display text-3xl text-[#1F6B4A]">You're verified</p>
            <p className="mt-2 text-sm text-[#1F6B4A]">The badge now shows on your cards. Still a mock. Still not Aadhaar.</p>
            <Link href="/discover" className="mt-4 inline-flex h-12 items-center rounded-full bg-[#1F6B4A] px-5 text-sm font-medium text-white">
              Back to swiping
            </Link>
          </div>
        ) : null}
      </main>
    </AppFrame>
  );
}
