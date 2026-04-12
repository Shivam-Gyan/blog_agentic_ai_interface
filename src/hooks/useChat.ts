// hooks/useChat.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { useConversationStore } from "@/stores/conversationStore";
import { useAgentStore } from "@/stores/agentStore";
import { useUserStore } from "@/stores/userStore";
import type { handleSubmitParameter } from "@/interfaces/chat.interface";
import type { Message, VerboseStep } from "@/interfaces/conversation.interface";

export function useChat() {
    const [isLoading, setIsLoading] = useState(false);

    const isMountedRef = useRef(true);
    const storeRef = useRef(useConversationStore.getState());
    const abortControllerRef = useRef<AbortController | null>(null); // ← new
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

    // ── Stop handler — just abort the fetch, server gets CancelledError ───────
    const handleStop = () => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
    };

    const handleSubmit = async ({ input }: handleSubmitParameter) => {
        const {
            createConversation,
            addMessage,
            appendAssistantMessage,
            appendAssistantReasoning,
            finalizeAssistantMessage,
            appendVerboseStep,
            setThinkingDone,
            setFinalBlogPost,
            markAssistantError,
            messages
        } = storeRef.current;

        let threadId = storeRef.current.currentThreadId;
        if (!threadId) {
            threadId = createConversation("New Chat");
            await new Promise((r) => setTimeout(r, 0));
        }

        setIsLoading(true);

        // Fresh controller per request
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            edit_id: null,
            role: "user",
            content: input,
            timestamp: Date.now(),
        };
        addMessage(threadId, userMsg);

        let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}/generate/${threadId}`,
                {
                    method: "POST",
                    signal: controller.signal, // ← wire it in
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${useUserStore.getState().jwtToken}`,
                    },
                    body: JSON.stringify({ user_query: input, mode }),
                }
            );

            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            if (!res.body) throw new Error("No response body");

            const assistantMsg: Message = {
                id: crypto.randomUUID(),
                retry_id: null,
                role: "assistant",
                content: "",
                timestamp: Date.now(),
            };
            addMessage(threadId, assistantMsg);

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
                        // ✅ Use new finalizeAssistantMessage with all three IDs
                        console.log("Finalizing message with response with edit_id:", data.edit_id, "retry_id:", data.retry_id, "checkpoint_id:", data.checkpoint_id);
                        finalizeAssistantMessage(
                            threadId,
                            data.response ?? "",
                            data.edit_id ?? null,
                            data.retry_id ?? null,
                            data.checkpoint_id ?? null,
                        );

                    } else if (data.type === "error") {
                        if (renderBuffer) { appendAssistantMessage(threadId, renderBuffer); renderBuffer = ""; }
                        setThinkingDone(threadId);
                        // ✅ retry_id will be null for internal errors — store handles that
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
            if (reader) { try { reader.cancel(); } catch (_) { } }

            // AbortError = user clicked stop — not a crash, flush what we have
            if (err?.name === "AbortError") {
                const { appendAssistantMessage, appendAssistantReasoning, setThinkingDone } = storeRef.current;
                // buffers are out of scope here so we just close the thinking panel
                setThinkingDone(threadId);
                console.info("Stream stopped by user (thread=%s)", threadId);
            } else {
                console.error("Stream error:", err);
            }
        } finally {
            abortControllerRef.current = null;
            if (isMountedRef.current) setIsLoading(false);
        }
    };

    return { handleSubmit, handleStop, isLoading };
}