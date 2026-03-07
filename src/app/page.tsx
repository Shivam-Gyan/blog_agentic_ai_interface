"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import ChatInterface from "@/components/chat.interface";
import ChatSidebar from "@/components/chat.sidebar";
import { useConversationStore } from "@/stores/conversationStore";
import { useAgentStore } from "@/stores/agentStore";
import type { handleSubmitParameter } from "@/interfaces/chat.interface";
import type { Message } from "@/interfaces/conversation.interface";

const EMPTY_MESSAGES: Message[] = [];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const currentThreadId         = useConversationStore((s) => s.currentThreadId);
  const createConversation      = useConversationStore((s) => s.createConversation);
  const addMessage              = useConversationStore((s) => s.addMessage);
  const appendAssistant         = useConversationStore((s) => s.appendAssistantMessage);
  const setLastAssistantContent = useConversationStore((s) => s.setLastAssistantContent);
  const messages                = useConversationStore((s) =>
    s.conversations.find((c) => c.thread_id === s.currentThreadId)?.messages ?? EMPTY_MESSAGES
  );
  const mode = useAgentStore((s) => s.mode);

  // Ensure at least one conversation exists on first load
  useEffect(() => {
    if (!currentThreadId) createConversation("New Chat");
  }, [currentThreadId, createConversation]);

  // Auto-scroll to latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async ({ input }: handleSubmitParameter) => {
    const threadId = currentThreadId ?? createConversation("New Chat");
    setIsLoading(true);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };
    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };
    addMessage(threadId, userMsg);
    addMessage(threadId, assistantMsg);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_query: input,
            mode: mode,
            thread_id: threadId,
          }),
        }
      );

      if (!res.body) return;

      const reader     = res.body.getReader();
      const decoder   = new TextDecoder();
      let buffer      = "";
      let renderBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const data = JSON.parse(line.slice(6));

          if (data.type === "token" && data.content) {
            renderBuffer += data.content;
            // Batch re-renders on newlines for performance (original behaviour)
            if (renderBuffer.includes("\n")) {
              appendAssistant(threadId, renderBuffer);
              renderBuffer = "";
            }
          } else if (data.type === "result" && data.content) {
            // Final consolidated response — replace any streamed content
            setLastAssistantContent(threadId, data.content);
            renderBuffer = "";
          }
        }
      }

      // Flush any remaining buffered tokens
      if (renderBuffer) appendAssistant(threadId, renderBuffer);

    } catch (err) {
      console.error("Stream error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* Sidebar */}
      <div
        className={`shrink-0 transition-all duration-300 z-20 ${
          sidebarOpen ? "md:w-72" : " w-0 md:w-16 h-screen"
        }`}
      >
        <ChatSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1 bg-white">

        {/* Messages */}
        <div className="flex-1 mt-16 md:mt-6 min-h-0 overflow-y-auto px-6 py-6 flex flex-col">

          {messages.length === 0 ? (

            <div className="flex flex-col items-center justify-center h-full opacity-80">
              <Image
                src="/Loomora_full_removebg.png"
                alt="logo"
                width={340}
                height={200}
                className="mb-6 select-none"
              />
            </div>

          ) : (

            <div className="w-full md:w-[80%] lg:w-3xl mx-auto flex flex-col gap-4">

              {messages.map((msg) => (

                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >

                  <div
                    className={`
                    px-4 py-3 pb-1 rounded-xl text-sm leading-relaxed max-w-[75%] 
                    ${msg.role === "user"
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"}
                  `}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        a: ({ href, children }) => (
                          <a href={href} className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-2">{children}</h2>,
                        p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-6 mb-3">{children}</ul>,
                      }}
                    >
                      {msg.content.replace(/(\S)(#{1,6}\s)/g, "$1\n\n$2")}
                    </ReactMarkdown>
                  </div>

                </div>

              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-xl bg-gray-100 text-sm">
                    Thinking...
                  </div>
                </div>
              )}

              <div ref={messageEndRef} />

            </div>

          )}

        </div>

        {/* Chat Input */}
        <div className="bg-white px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl bg-[#efeff0] px-4 py-3 shadow-sm">
              <ChatInterface onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
