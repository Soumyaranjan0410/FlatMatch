"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Heart, House, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { clearSessionMemory, useSession } from "@/lib/session-client";
import type { Me } from "@/lib/types";

export function Mark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative grid size-9 place-items-center">
        <span className="absolute inset-0 rounded-[11px] bg-primary" />
        <span className="absolute top-1.5 left-1.5 size-3.5 rounded-md bg-[#E8B86D]" />
        <House className="relative size-4 text-white" strokeWidth={2.4} />
      </span>
      {compact ? null : <span className="font-display text-[1.65rem] leading-none tracking-tight">FlatMatch</span>}
    </span>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-10">
      <div>
        <Mark />
        <p className="mt-8 max-w-md font-display text-5xl leading-[1.05] tracking-tight text-balance">
          A room, and someone you can actually live with.
        </p>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
          Swipe rooms and people in Bengaluru, Pune and Mumbai. A chat opens only when the like is mutual.
        </p>
      </div>
      <ol className="max-w-sm space-y-4 text-sm">
        <li className="flex gap-3">
          <Sparkles className="mt-0.5 size-4 text-primary" />
          <span>Lifestyle match score on every card — food, smoke, nights, cleanliness, language.</span>
        </li>
        <li className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-4 text-primary" />
          <span>Women-only mode, a mock DigiLocker check, and a no-brokers pledge.</span>
        </li>
        <li className="flex gap-3">
          <Heart className="mt-0.5 size-4 text-primary" />
          <span>Demo OTP is 123456. Nothing here calls a real SMS or Aadhaar service.</span>
        </li>
      </ol>
    </aside>
  );
}

export function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#e7dfd2]">
      <div className="text-center">
        <Mark />
        <p className="mt-3 text-sm text-muted-foreground">Finding your city…</p>
      </div>
    </div>
  );
}

const TABS = [
  { href: "/discover", label: "Discover", icon: Sparkles },
  { href: "/matches", label: "Matches", icon: Heart },
  { href: "/list", label: "Room", icon: House },
  { href: "/profile", label: "You", icon: UserRound },
];

function TabBar({ user }: { user: Me }) {
  const pathname = usePathname();
  return (
    <nav className="grid grid-cols-4 border-t border-border bg-card/95 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] backdrop-blur">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
            {tab.label}
            {tab.href === "/matches" && user.matchCount > 0 ? (
              <span className="absolute top-0 right-[calc(50%-22px)] grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground">
                {user.matchCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppFrame({
  children,
  allow,
  hideNav = false,
}: {
  children: React.ReactNode;
  allow: "guest" | "onboarding" | "app";
  hideNav?: boolean;
}) {
  const { state } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (state.status === "loading") return;
    if (allow === "app" && state.status !== "app") {
      router.replace(state.status === "onboarding" ? "/onboarding" : "/");
    } else if (allow === "onboarding" && state.status === "anon") {
      router.replace("/login");
    } else if (allow === "onboarding" && state.status === "app") {
      router.replace("/discover");
    } else if (allow === "guest" && state.status === "onboarding") {
      router.replace("/onboarding");
    } else if (allow === "guest" && state.status === "app") {
      router.replace("/discover");
    }
  }, [allow, router, state]);

  const ready =
    (allow === "guest" && state.status === "anon") ||
    (allow === "onboarding" && state.status === "onboarding") ||
    (allow === "app" && state.status === "app");

  if (!ready) return <Splash />;

  const user = state.status === "app" ? state.user : null;

  return (
    <div className="min-h-dvh bg-[#e7dfd2] lg:grid lg:grid-cols-[minmax(0,1fr)_440px]">
      <BrandPanel />
      <div className="relative mx-auto flex h-dvh w-full max-w-[440px] flex-col overflow-hidden bg-background shadow-[0_0_0_1px_rgba(28,25,21,0.06)]">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        {user && !hideNav ? <TabBar user={user} /> : null}
      </div>
    </div>
  );
}

export function forgetSession() {
  clearSessionMemory();
}
