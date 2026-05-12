"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Copy,
  Edit3,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { ChatService } from "@/lib/api/services/ChatService";
import { Routes } from "@/lib/api/FrontendRoutes";
import type { ChatConversation, ChatMessage } from "@/lib/api/types";
import { SUGGESTED_CHAT_PROMPTS } from "../../chat/prompts";

function formatThreadDate(value: string | null) {
  if (!value) return "New";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

function sortMessages(messages: ChatMessage[]) {
  return [...messages].sort((a, b) => a.message_index - b.message_index);
}

export default function ChatThreadPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const conversationId = params.id;
  const [threads, setThreads] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === conversationId) ?? null,
    [threads, conversationId]
  );

  useEffect(() => {
    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) setIsLoading(true);
    });
    Promise.all([
      ChatService.listConversations(),
      ChatService.messages(conversationId),
    ])
      .then(([threadList, threadMessages]) => {
        if (ignore) return;
        setThreads(threadList);
        setMessages(sortMessages(threadMessages));
        setError("");
      })
      .catch(() => {
        if (!ignore) setError("We could not load this conversation.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [conversationId]);

  async function createThread() {
    setIsBusy(true);
    try {
      const thread = await ChatService.createConversation();
      setThreads((current) => [thread, ...current]);
      router.push(Routes.dashboardRoutes.chatThread(thread.id));
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteThread(threadId: string) {
    setIsBusy(true);
    try {
      await ChatService.deleteConversation(threadId);
      const remaining = threads.filter((thread) => thread.id !== threadId);
      setThreads(remaining);
      if (threadId === conversationId) {
        if (remaining[0]) router.push(Routes.dashboardRoutes.chatThread(remaining[0].id));
        else {
          const next = await ChatService.createConversation();
          router.push(Routes.dashboardRoutes.chatThread(next.id));
        }
      }
    } finally {
      setIsBusy(false);
    }
  }

  async function renameThread(threadId: string) {
    const title = renameDraft.trim();
    if (!title) return;
    setIsBusy(true);
    try {
      const updated = await ChatService.renameConversation(threadId, title);
      setThreads((current) => current.map((thread) => (thread.id === threadId ? updated : thread)));
      setRenamingId(null);
      setRenameDraft("");
    } finally {
      setIsBusy(false);
    }
  }

  async function sendMessage(text = draft) {
    const content = text.trim();
    if (!content || isBusy) return;
    setIsBusy(true);
    setDraft("");
    setError("");
    try {
      const response = await ChatService.sendMessage(conversationId, content);
      setMessages(sortMessages(response.messages));
      setThreads((current) =>
        current.map((thread) => (thread.id === conversationId ? response.conversation : thread))
      );
    } catch {
      setDraft(content);
      setError("Kalms could not reply yet. Check the LLM configuration and try again.");
    } finally {
      setIsBusy(false);
    }
  }

  async function copyMessage(message: ChatMessage) {
    await navigator.clipboard.writeText(message.content);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(null), 1400);
  }

  function startEdit(message: ChatMessage) {
    setEditingIndex(message.message_index);
    setEditDraft(message.content);
  }

  async function submitEdit() {
    if (editingIndex === null || !editDraft.trim()) return;
    setIsBusy(true);
    setError("");
    try {
      const response = await ChatService.editMessage(conversationId, editingIndex, editDraft.trim());
      setMessages(sortMessages(response.messages));
      setThreads((current) =>
        current.map((thread) => (thread.id === conversationId ? response.conversation : thread))
      );
      setEditingIndex(null);
      setEditDraft("");
    } catch {
      setError("We could not update that message yet.");
    } finally {
      setIsBusy(false);
    }
  }

  async function regenerate(message: ChatMessage) {
    setIsBusy(true);
    setError("");
    try {
      const response = await ChatService.regenerateMessage(conversationId, message.message_index);
      setMessages(sortMessages(response.messages));
      setThreads((current) =>
        current.map((thread) => (thread.id === conversationId ? response.conversation : thread))
      );
    } catch {
      setError("We could not regenerate that response yet.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 bg-[#f8fafc]">
      <aside className="hidden w-80 shrink-0 border-r border-[#e5e7eb] bg-white lg:flex lg:flex-col">
        <div className="border-b border-[#e5e7eb] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">Kalms chats</p>
              <h1 className="mt-1 text-lg font-semibold text-[#111827]">Conversation threads</h1>
            </div>
            <button
              type="button"
              onClick={createThread}
              disabled={isBusy}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-strong disabled:opacity-60"
              aria-label="Create new chat"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {threads.map((thread) => {
            const isActive = thread.id === conversationId;
            return (
              <div
                key={thread.id}
                className={`rounded-[18px] border p-3 transition ${
                  isActive ? "border-primary/20 bg-[#ede7ff]" : "border-transparent bg-white hover:bg-[#f8fafc]"
                }`}
              >
                {renamingId === thread.id ? (
                  <div className="space-y-2">
                    <input
                      value={renameDraft}
                      onChange={(event) => setRenameDraft(event.target.value)}
                      className="w-full rounded-[14px] border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                      aria-label="Rename chat"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => renameThread(thread.id)}
                        className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingId(null)}
                        className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#6b7280]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => router.push(Routes.dashboardRoutes.chatThread(thread.id))}
                      className="w-full text-left"
                    >
                      <p className="truncate text-sm font-semibold text-[#111827]">{thread.title || "New chat"}</p>
                      <p className="mt-1 text-xs text-[#6b7280]">{formatThreadDate(thread.last_message_at)}</p>
                    </button>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingId(thread.id);
                          setRenameDraft(thread.title || "New chat");
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#6b7280] hover:text-primary"
                      >
                        <Pencil size={12} />
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteThread(thread.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#6b7280] hover:text-red-600"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] bg-white px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#eadcff] bg-[#f3e8ff] text-primary">
              <Sparkles size={20} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-[#111827]">{activeThread?.title || "Kalms AI Companion"}</p>
              <p className="text-sm text-[#6b7280]">Supportive guidance, not diagnosis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={createThread}
            disabled={isBusy}
            className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-[#ede7ff] px-4 py-2 text-sm font-semibold text-primary transition hover:bg-[#e5d8ff] disabled:opacity-60 lg:hidden"
          >
            <Plus size={16} />
            New
          </button>
        </div>

        {error && (
          <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 sm:px-6">
            {error}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {isLoading ? (
              <div className="rounded-[24px] bg-white p-6 text-sm font-medium text-[#6b7280] shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
                Loading this conversation...
              </div>
            ) : messages.length ? (
              messages.map((message) => {
                const isUser = message.role === "user";
                const isEditing = editingIndex === message.message_index;
                return (
                  <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[88%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
                      <div
                        className={`rounded-[24px] px-4 py-3 text-sm leading-6 shadow-sm ${
                          isUser ? "bg-primary text-white" : "border border-[#e5e7eb] bg-white text-[#111827]"
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              value={editDraft}
                              onChange={(event) => setEditDraft(event.target.value)}
                              className="min-h-24 w-full rounded-[18px] border border-[#e5e7eb] bg-white p-3 text-sm text-[#111827] outline-none focus:border-primary"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={submitEdit}
                                disabled={isBusy}
                                className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                              >
                                Save edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingIndex(null);
                                  setEditDraft("");
                                }}
                                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-[#6b7280]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>
                      {!isEditing && (
                        <div className="flex flex-wrap items-center gap-2 px-1">
                          <button
                            type="button"
                            onClick={() => copyMessage(message)}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-[#6b7280] hover:bg-white hover:text-primary"
                          >
                            <Copy size={12} />
                            {copiedId === message.id ? "Copied" : "Copy"}
                          </button>
                          {isUser ? (
                            <button
                              type="button"
                              onClick={() => startEdit(message)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-[#6b7280] hover:bg-white hover:text-primary disabled:opacity-60"
                            >
                              <Edit3 size={12} />
                              Edit
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => regenerate(message)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-[#6b7280] hover:bg-white hover:text-primary disabled:opacity-60"
                            >
                              <RefreshCw size={12} />
                              Regenerate
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ede7ff] text-primary">
                    <MessageCircle size={20} />
                  </span>
                  <div>
                    <h2 className="font-semibold text-[#111827]">Start gently</h2>
                    <p className="text-sm text-[#6b7280]">Choose a prompt or write what is on your mind.</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {SUGGESTED_CHAT_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="rounded-[18px] border border-[#e5e7eb] bg-[#f8fafc] p-4 text-left text-sm font-medium leading-6 text-[#111827] transition hover:border-primary/25 hover:bg-[#fbfaff]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isBusy && (
              <div className="flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-sm font-medium text-[#6b7280] shadow-sm">
                <MoreHorizontal size={16} className="text-primary" />
                Kalms is thinking...
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#e5e7eb] bg-white px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-[24px] border border-[#e5e7eb] bg-[#f8fafc] p-3 focus-within:border-primary">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Share what is on your mind..."
              className="max-h-36 min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-[#111827] outline-none placeholder:text-[#9ca3af]"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!draft.trim() || isBusy}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-strong disabled:opacity-50"
              aria-label="Send message"
            >
              {isBusy ? <X size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
