// hooks/useRetry.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { useConversationStore } from "@/stores/conversationStore";
import { useAgentStore } from "@/stores/agentStore";
import { useUserStore } from "@/stores/userStore";
import type { VerboseStep } from "@/interfaces/conversation.interface";

export function useRetry() {
  const [isRetrying, setIsRetrying] = useState(false);

  const isMountedRef = useRef(true);
  const storeRef = useRef(useConversationStore.getState());
  const abortControllerRef = useRef<AbortController | null>(null);
  const mode = useAgentStore((s) => s.mode);

  useEffect(() => {
    const unsub = useConversationStore.subscribe(
      (state) => { storeRef.current = state; }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const handleStopRetry = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  };

  const handleRetry = async ({
    messageId,       // the assistant message being retried
    retryId,         // retry_checkpoint_id — the fixed launchpad
    userQuery,       // original user query — needed by backend for logging
  }: {
    messageId: string;
    retryId: string;
    userQuery: string;
  }) => {
    const {
      appendAssistantMessage,
      appendAssistantReasoning,
      appendVerboseStep,
      setThinkingDone,
      setFinalBlogPost,
      appendRetryVersion,
      resetAssistantForRetry,
    } = storeRef.current;

    const threadId = storeRef.current.currentThreadId;
    if (!threadId) return;

    setIsRetrying(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // ✅ Reset the assistant message so streaming starts fresh visually
    resetAssistantForRetry(threadId, messageId);

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}/retry/${threadId}/${retryId}`,
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useUserStore.getState().jwtToken}`,
          },
          body: JSON.stringify({
            mode,
            user_query: userQuery,
          }),
        }
      );

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      if (!res.body) throw new Error("No response body");

      reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let renderBuffer = "";
      let reasoningBuffer = "";
      let firstTokenReceived = false;
      let streamError = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          let data: any;
          try { data = JSON.parse(line.slice(6)); }
          catch { continue; }

          if (data.type === "verbose" && data.content) {
            const step: VerboseStep = {
              content: data.content,
              detail: data.detail ?? null,
              state: "active",
              id: crypto.randomUUID(),
            };
            appendVerboseStep(threadId, step);

          } else if (data.type === "token" && data.content) {
            if (!firstTokenReceived) { firstTokenReceived = true; setThinkingDone(threadId); }
            renderBuffer += data.content;
            if (renderBuffer.includes("\n")) {
              appendAssistantMessage(threadId, renderBuffer);
              renderBuffer = "";
            }

          } else if (data.type === "reasoning" && data.content) {
            if (!firstTokenReceived) { firstTokenReceived = true; setThinkingDone(threadId); }
            reasoningBuffer += data.content;
            if (reasoningBuffer.includes("\n") || reasoningBuffer.length > 200) {
              appendAssistantReasoning(threadId, reasoningBuffer);
              reasoningBuffer = "";
            }

          } else if (data.type === "result") {
            if (renderBuffer) { appendAssistantMessage(threadId, renderBuffer); renderBuffer = ""; }
            if (reasoningBuffer) { appendAssistantReasoning(threadId, reasoningBuffer); reasoningBuffer = ""; }
            if (mode === "generate" && data.final_blog) setFinalBlogPost(threadId, data.final_blog);
            setThinkingDone(threadId);

            // ✅ Append as new version — no edit_id, no retry_id (frontend already has them)
            appendRetryVersion(
              threadId,
              messageId,
              data.response ?? "",
              data.checkpoint_id ?? null,
              data.final_blog ?? undefined,
            );

          } else if (data.type === "error") {
            if (renderBuffer) { appendAssistantMessage(threadId, renderBuffer); renderBuffer = ""; }
            setThinkingDone(threadId);

            // ✅ On retry error — don't wipe retry_id, user can try again
            // Just restore content to show error message visually
            appendRetryVersion(
              threadId,
              messageId,
              "[Retry failed — try again]",
              null,   // no valid checkpoint
              undefined,
            );

            streamError = true;
            break;
          }
        }

        if (streamError) break;
      }

      if (renderBuffer) appendAssistantMessage(threadId, renderBuffer);
      if (reasoningBuffer) appendAssistantReasoning(threadId, reasoningBuffer);

    } catch (err: any) {
      if (reader) { try { reader.cancel(); } catch (_) { } }

      if (err?.name === "AbortError") {
        setThinkingDone(threadId);
        console.info("Retry stopped by user (thread=%s)", threadId);
        // ✅ Don't append a failed version on user cancel
        // The reset already cleared content — restore last known good version
        const msg = storeRef.current.messages.find((m) => m.id === messageId);
        if (msg && msg.versions && msg.versions.length > 0) {
          const lastGood = msg.versions[msg.versions.length - 1];
          // Restore the last completed version visually
          storeRef.current.switchVersion(threadId, messageId, msg.versions.length - 1);
        }
      } else {
        console.error("Retry stream error:", err);
      }
    } finally {
      abortControllerRef.current = null;
      if (isMountedRef.current) setIsRetrying(false);
    }
  };

  return { handleRetry, handleStopRetry, isRetrying };
}