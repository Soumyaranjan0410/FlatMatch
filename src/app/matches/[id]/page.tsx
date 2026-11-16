"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { SafetyDialog } from "@/components/safety-dialog";
import { AppFrame } from "@/components/shell";
import { ICEBREAKERS } from "@/lib/constants";
import { api } from "@/lib/client";
import { inr, shortDate } from "@/lib/format";
import type { ChatMessage, PublicListing, PublicPerson } from "@/lib/types";

type Thread = {
  match: { id: string; other: PublicPerson; listing: PublicListing | null; blocked: boolean };
  messages: ChatMessage[];
};

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [thread, setThread] = useState<Thread | null>(null);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [safety, setSafety] = useState(false);
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

  const other = thread?.match.other;

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
          <button type="submit" disabled={!text.trim() || sending || thread?.match.blocked} className="h-12 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-40">
            Send
          </button>
        </form>
      </div>
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
