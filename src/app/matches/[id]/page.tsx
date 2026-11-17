import { Suspense } from "react";
import { ChatScreen } from "@/components/chat-screen";

export default function MatchChatPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Opening chat…</p>}>
      <ChatScreen params={params} />
    </Suspense>
  );
}
