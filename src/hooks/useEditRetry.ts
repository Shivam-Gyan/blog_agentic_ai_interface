// hooks/useEditRetry.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { useConversationStore } from "@/stores/conversationStore";
import { useAgentStore } from "@/stores/agentStore";
import { useUserStore } from "@/stores/userStore";
import type { VerboseStep } from "@/interfaces/conversation.interface";

export function useEditRetry() {
  const [isEditingRetrying, setIsEditingRetrying] = useState(false);

  const isMountedRef = useRef(true);
  const storeRef = useRef(useConversationStore.getState());
  const abortControllerRef = useRef<AbortController | null>(null);
  const mode = useAgentStore((s) => s.mode);

  useEffect(() => {
    const unsub = useConversationStore.subscribe((state) => {
      storeRef.current = state;
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleStopEditRetry = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  };

  const handleEditRetry = async ({
    messageId,
    editCheckpointId,
    newUserQuery,
  }: {
    messageId: string;
    editCheckpointId: string;
    newUserQuery: string;
  }) => {
    if (!editCheckpointId) {
      console.error("Edit retry skipped: missing edit checkpoint id for message:", messageId);
      return;
    }

    const {
      appendAssistantMessage,
      appendAssistantReasoning,
      appendVerboseStep,
      setThinkingDone,
      setFinalBlogPost,
      finalizeAssistantMessage,
      markAssistantError,
      prepareEditRetry,
    } = storeRef.current;

    const threadId = storeRef.current.currentThreadId;
    if (!threadId) return;

    setIsEditingRetrying(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    console.log(messageId, editCheckpointId, newUserQuery);
    prepareEditRetry(threadId, messageId, newUserQuery);

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}/edit/${threadId}/${editCheckpointId}`,
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useUserStore.getState().jwtToken}`,
          },
          body: JSON.stringify({
            mode,
            new_user_query: newUserQuery,
            edit_checkpoint_id: editCheckpointId,
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
          try {
            data = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (data.type === "verbose" && data.content) {
            const step: VerboseStep = {
              content: data.content,
              detail: data.detail ?? null,
              state: "active",
              id: crypto.randomUUID(),
            };
            appendVerboseStep(threadId, step);
          } else if (data.type === "token" && data.content) {
            if (!firstTokenReceived) {
              firstTokenReceived = true;
              setThinkingDone(threadId);
            }
            renderBuffer += data.content;
            if (renderBuffer.includes("\n")) {
              appendAssistantMessage(threadId, renderBuffer);
              renderBuffer = "";
            }
          } else if (data.type === "reasoning" && data.content) {
            if (!firstTokenReceived) {
              firstTokenReceived = true;
              setThinkingDone(threadId);
            }
            reasoningBuffer += data.content;
            if (reasoningBuffer.includes("\n") || reasoningBuffer.length > 200) {
              appendAssistantReasoning(threadId, reasoningBuffer);
              reasoningBuffer = "";
            }
          } else if (data.type === "result") {
            if (renderBuffer) {
              appendAssistantMessage(threadId, renderBuffer);
              renderBuffer = "";
            }
            if (reasoningBuffer) {
              appendAssistantReasoning(threadId, reasoningBuffer);
              reasoningBuffer = "";
            }
            if (mode === "generate" && data.final_blog) {
              setFinalBlogPost(threadId, data.final_blog);
            }
            setThinkingDone(threadId);
            console.log(
              "Finalizing edited message with response with edit_id:",
              data.edit_id,
              "retry_id:",
              data.retry_id,
              "checkpoint_id:",
              data.checkpoint_id
            );
            finalizeAssistantMessage(
              threadId,
              data.response ?? "",
              data.edit_id ?? null,
              data.retry_id ?? null,
              data.checkpoint_id ?? null,
            );
          } else if (data.type === "error") {
            if (renderBuffer) {
              appendAssistantMessage(threadId, renderBuffer);
              renderBuffer = "";
            }
            setThinkingDone(threadId);
            markAssistantError(
              threadId,
              data.edit_id ?? null,
              data.retry_id ?? null,
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
      if (reader) {
        try {
          reader.cancel();
        } catch {
          // ignore cancel failures
        }
      }

      if (err?.name === "AbortError") {
        setThinkingDone(threadId);
        console.info("Edit stream stopped by user (thread=%s)", threadId);
      } else {
        console.error("Edit stream error:", err);
      }
    } finally {
      abortControllerRef.current = null;
      if (isMountedRef.current) setIsEditingRetrying(false);
    }
  };

  return { handleEditRetry, handleStopEditRetry, isEditingRetrying };
}
