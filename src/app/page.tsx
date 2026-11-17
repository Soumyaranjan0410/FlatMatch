"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppFrame, Mark } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import { api } from "@/lib/client";
import { useSession } from "@/lib/session-client";

export default function WelcomePage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState("");

  async function enterDemo(loginId: string) {
    setBusy(loginId);
    try {
      await api("/api/auth/demo", { method: "POST", body: JSON.stringify({ loginId }) });
      await refresh();
      router.push("/discover");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't open that profile.");
    } finally {
      setBusy("");
    }
  }

  return (
    <AppFrame allow="guest">
      <main className="flex min-h-0 flex-1 flex-col justify-between px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">Bengaluru · Pune · Hyderabad · Mumbai · Delhi NCR · Chennai</p>
          <div className="mt-6">
            <Mark />
          </div>
          <h1 className="mt-8 font-display text-[3.1rem] leading-[0.95] tracking-tight text-balance">
            Skip the broker. Meet the flatmate.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Swipe rooms and people. A chat unlocks only when you both say yes — food, nights, pets and all.
          </p>
        </div>
        <div className="mt-8 grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            {["Veg kitchen", "Women only", "No brokers"].map((item) => (
              <div key={item} className="rounded-2xl bg-muted px-2 py-3 text-center text-xs font-medium">
                {item}
              </div>
            ))}
          </div>
          <Button size="xl" className="w-full" onClick={() => router.push("/login")}>
            Continue with phone
          </Button>
          <Button size="xl" variant="outline" className="w-full" onClick={() => router.push("/login?method=email")}>
            Use email instead
          </Button>
          <button type="button" className="py-2 text-sm font-medium text-primary" onClick={() => setOpen(true)}>
            Preview a demo profile
          </button>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            This demo mocks OTP and KYC. The code is always 123456. Do not enter a real Aadhaar number.
          </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto rounded-t-3xl">
            <SheetHeader>
              <SheetTitle className="font-display text-2xl">Demo profiles</SheetTitle>
              <SheetDescription>These accounts already live in Bengaluru, Pune and Mumbai. Ananya has an open chat.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-2 px-4 pb-6">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.loginId}
                  type="button"
                  disabled={busy === account.loginId}
                  onClick={() => enterDemo(account.loginId)}
                  className="rounded-2xl border px-4 py-3 text-left"
                >
                  <span className="block font-medium">{account.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {account.role} · {account.city} · {account.blurb}
                  </span>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </main>
    </AppFrame>
  );
}
