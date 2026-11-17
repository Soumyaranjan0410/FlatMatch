"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { SafetyDialog } from "@/components/safety-dialog";
import { AppFrame } from "@/components/shell";
import { ICEBREAKERS } from "@/lib/constants";
import { api } from "@/lib/client";
import { phoneLabel } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session-client";
import { inr, shortDate } from "@/lib/format";
import type { ChatMessage, PublicListing, PublicPerson } from "@/lib/types";

type Thread = {
  match: {
    id: string;
    other: PublicPerson;
    listing: PublicListing | null;
    blocked: boolean;
    visitWhen: string;
    visitPlace: string;
    visitNote: string;
  };
  messages: ChatMessage[];
};

export function ChatScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [thread, setThread] = useState<Thread | null>(null);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [safety, setSafety] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [visitWhen, setVisitWhen] = useState("Saturday, 11:00");
  const [visitPlace, setVisitPlace] = useState("");
  const [visitNote, setVisitNote] = useState("Meet at the society gate. No payment before the visit.");
  const { t } = useLang();
  const { state } = useSession();
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  async function load(initial = false) {
    try {
      const data = await api<Thread>(`/api/matches/${id}`);
      setThread((current) => {
        if (!current || current.messages.length !== data.messages.length || current.match.blocked !== data.match.blocked) {
          return data;
        }
        return current;
      });
      setError("");
      if (initial) stick.current = true;
    } catch (err) {
      if (initial) setError(err instanceof Error ? err.message : "Couldn't open this chat.");
    }
  }

  useEffect(() => {
    void load(true);
    const timer = window.setInterval(() => void load(false), 2500);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (stick.current && scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
  }, [thread?.messages.length]);

  async function send(body: string) {
    const trimmed = body.trim();
    if (!trimmed || sending || thread?.match.blocked) return;
    setSending(true);
    setText("");
    stick.current = true;
    try {
      const data = await api<{ message: ChatMessage }>(`/api/matches/${id}`, {
        method: "POST",
        body: JSON.stringify({ body: trimmed }),
      });
      setThread((current) => current ? { ...current, messages: [...current.messages, data.message] } : current);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Message didn't send.");
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  async function saveVisit() {
    try {
      const visit = await api<{ visitWhen: string; visitPlace: string; visitNote: string }>(`/api/matches/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ visitWhen, visitPlace, visitNote }),
      });
      setThread((current) => current ? { ...current, match: { ...current.match, ...visit } } : current);
      const text = [
        "FlatMatch visit plan",
        `When: ${visit.visitWhen}`,
        `Where: ${visit.visitPlace}`,
        thread?.match.other.name ? `Meeting: ${thread.match.other.name}` : "",
        visit.visitNote,
        "I have not paid any token or deposit yet.",
      ].filter(Boolean).join("\n");
      await navigator.clipboard.writeText(text).catch(() => undefined);
      toast.success("Visit plan saved. The text is copied so you can send it to a friend.");
      setVisitOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the visit.");
    }
  }

  const other = thread?.match.other;
  const myPhone = state.status === "app" ? state.user.phone : "";

  return (
    <AppFrame allow="app" hideNav>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <Link href="/matches" aria-label="Back to matches" className="grid size-10 place-items-center rounded-full">
            <ArrowLeft className="size-5" />
          </Link>
          {other ? (
            <>
              <img src={other.photo} alt="" className="size-10 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{other.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {thread?.match.blocked ? "Blocked" : "Live · checks every few seconds"}
                  {thread?.match.listing ? ` · ${thread.match.listing.locality} ${inr(thread.match.listing.rent)}` : ""}
                </p>
              </div>
              <button type="button" className="rounded-full border px-2 py-1 text-[11px]" onClick={() => {
                setVisitPlace(thread?.match.listing?.locality || other.area);
                setVisitOpen(true);
              }}>{t("shareVisit")}</button>
              <button type="button" aria-label="Report or block" className="grid size-10 place-items-center" onClick={() => setSafety(true)}>
                <ShieldAlert className="size-5" />
              </button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{error || "Opening chat…"}</p>
          )}
        </header>
        <div
          ref={scroller}
          onScroll={(event) => {
            const node = event.currentTarget;
            stick.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
          }}
          className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4"
        >
          {error && !thread ? <p className="text-sm text-destructive">{error}</p> : null}
          {thread && thread.messages.length === 0 ? (
            <div className="rounded-3xl bg-muted px-4 py-5 text-center">
              <p className="font-display text-2xl">Say something useful</p>
              <p className="mt-1 text-sm text-muted-foreground">A visit time, the deposit, or whether a broker is involved.</p>
            </div>
          ) : null}
          {thread?.messages.map((message) => (
            <div key={message.id} className={message.mine ? "flex justify-end" : "flex justify-start"}>
              <div className={message.mine ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground" : "max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm"}>
                <p>{message.body}</p>
                <p className={message.mine ? "mt-1 text-[10px] text-white/70" : "mt-1 text-[10px] text-muted-foreground"}>{shortDate(message.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
          {thread?.match.visitWhen ? (
            <div className="mx-4 mb-2 rounded-2xl bg-[#E7F3EC] px-3 py-2 text-xs text-[#1F6B4A]">
              Visit: {thread.match.visitWhen} · {thread.match.visitPlace}. {thread.match.visitNote}
            </div>
          ) : null}
          {thread && thread.messages.length === 0 && !thread.match.blocked ? (
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
            {ICEBREAKERS.map((line) => (
              <button key={line} type="button" onClick={() => send(line)} className="shrink-0 rounded-full border px-3 py-1.5 text-xs">
                {line}
              </button>
            ))}
          </div>
        ) : null}
        <form
          className="flex items-center gap-2 border-t px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          onSubmit={(event) => {
            event.preventDefault();
            void send(text);
          }}
        >
          <input
            value={text}
            disabled={!thread || thread.match.blocked}
            onChange={(event) => setText(event.target.value)}
            placeholder={thread?.match.blocked ? "This chat is closed" : "Message"}
            className="h-12 flex-1 rounded-full border bg-card px-4 text-base outline-none"
          />
          {myPhone && !thread?.match.blocked ? (
            <button
              type="button"
              className="h-12 rounded-full border px-3 text-xs"
              onClick={() => send(`You can reach me at ${phoneLabel(myPhone)}. I am sharing this only because we matched.`)}
            >
              {t("shareNumber")}
            </button>
          ) : null}
          <button type="submit" disabled={!text.trim() || sending || thread?.match.blocked} className="h-12 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-40">
            Send
          </button>
        </form>
      </div>
      {visitOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-[#1c1915]/50 p-4">
          <form
            className="w-full max-w-sm rounded-3xl bg-card p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void saveVisit();
            }}
          >
            <p className="font-display text-2xl">{t("shareVisit")}</p>
            <p className="mt-1 text-xs text-muted-foreground">This note does not include anyone's phone number. Copy it to a friend before you go.</p>
            <input value={visitWhen} onChange={(event) => setVisitWhen(event.target.value)} className="mt-3 h-11 w-full rounded-xl border px-3" placeholder="When" />
            <input value={visitPlace} onChange={(event) => setVisitPlace(event.target.value)} className="mt-2 h-11 w-full rounded-xl border px-3" placeholder="Where" />
            <textarea value={visitNote} onChange={(event) => setVisitNote(event.target.value)} className="mt-2 min-h-20 w-full rounded-xl border px-3 py-2" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" className="h-11 rounded-full border" onClick={() => setVisitOpen(false)}>Cancel</button>
              <button type="submit" className="h-11 rounded-full bg-primary text-primary-foreground">Save and copy</button>
            </div>
          </form>
        </div>
      ) : null}
      {other ? (
        <SafetyDialog
          open={safety}
          onOpenChange={setSafety}
          targetUserId={other.id}
          name={other.name.split(" ")[0]}
          onBlocked={() => void load(false)}
        />
      ) : null}
    </AppFrame>
  );
}
