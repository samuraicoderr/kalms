"use client";

import { useEffect, useState } from "react";
import { Card, PageHeader, SafetyNote, SoftIcon } from "../components/DashboardUI";
import { ChatService } from "@/lib/api/services/ChatService";
import type { ChatConversation, ChatMessage } from "@/lib/api/types";
import { MessageCircle, Sparkles, Wind } from "lucide-react";

const prompts = [
  "I feel overwhelmed and need to slow down.",
  "Help me plan a calmer study session.",
  "I want to understand why my stress keeps rising.",
  "Give me a short grounding exercise.",
];

export default function ChatPage() {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    ChatService.activeConversation().then(async (active) => {
      setConversation(active);
      setMessages(await ChatService.messages(active.id));
    });
  }, []);

  async function send(text = content) {
    if (!conversation || !text.trim()) return;
    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      conversation: conversation.id,
      role: "user",
      content: text.trim(),
      model_name: "",
      safety_flags: {},
      metadata: {},
      token_count: null,
      created_at: new Date().toISOString(),
    };
    setMessages((current) => [...current, userMessage]);
    setContent("");
    setIsSending(true);
    try {
      const reply = await ChatService.sendMessage(conversation.id, text.trim());
      setMessages((current) => [...current, reply]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Chat companion"
        title="Talk things through with Kalms AI Companion."
        description="A warm, patient space for reflection, coping ideas, and gentle next steps. It does not diagnose or replace professional care."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="min-h-[520px]">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
            <div className="flex items-center gap-3">
              <SoftIcon icon={Sparkles} tone="purple" />
              <div>
                <h2 className="font-semibold text-[#111827]">Kalms AI Companion</h2>
                <p className="text-sm text-[#6b7280]">Supportive guidance, not diagnosis</p>
              </div>
            </div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">Online</span>
          </div>
          <div className="mt-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[82%] rounded-[22px] px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-primary text-white" : "bg-slate-50 text-[#111827]"}`}>
                  {message.content}
                </p>
              </div>
            ))}
            {!messages.length && (
              <p className="rounded-[22px] bg-slate-50 px-4 py-3 text-sm leading-6 text-[#111827]">
                I am here with you. What feels heaviest right now?
              </p>
            )}
          </div>
          <div className="mt-8 rounded-[22px] border border-[#e5e7eb] bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <input
                aria-label="Message Kalms AI Companion"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") send();
                }}
                placeholder="Type what you are feeling..."
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[#9ca3af]"
              />
              <button onClick={() => send()} disabled={isSending} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                Send
              </button>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3">
              <SoftIcon icon={MessageCircle} tone="purple" />
              <div>
                <p className="text-sm font-medium text-primary">Suggested prompts</p>
                <h2 className="text-xl font-semibold text-[#111827]">Start gently</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {prompts.map((prompt) => (
                <button key={prompt} onClick={() => send(prompt)} className="rounded-[18px] border border-[#e5e7eb] bg-[#f8fafc] p-4 text-left text-sm font-medium leading-6 text-[#111827] transition hover:border-primary/25 hover:bg-[#fbfaff]">
                  {prompt}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex gap-4">
              <SoftIcon icon={Wind} tone="blue" />
              <div>
                <h2 className="text-xl font-semibold text-[#111827]">Quick reset</h2>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                  Breathe in for four, hold for four, breathe out for six. Repeat three times before replying.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SafetyNote />
    </div>
  );
}
