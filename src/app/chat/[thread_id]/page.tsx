// "use client";

// import { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import ChatInterface from "@/components/chat.interface";
// import ChatSidebar from "@/components/chat.sidebar";
// import { useConversationStore } from "@/stores/conversationStore";
// import { useAgentStore } from "@/stores/agentStore";
// import type { handleSubmitParameter } from "@/interfaces/chat.interface";
// import type { Message, VerboseStep } from "@/interfaces/conversation.interface";
// import { useUserStore } from "@/stores/userStore";
// import { useRouter, useParams } from "next/navigation";
// import AIMessage from "@/components/chat.assissant.message";
// import UserMessage from "@/components/chat.user.message";

// const EMPTY_MESSAGES: Message[] = [];

// interface Props {
//   message: any;
//   user: any;
//   isLoading?: boolean;
// }

// function MessageRenderer({ message, user, isLoading }: Props) {
//   if (message.role === "user") {
//     return <UserMessage message={message} user={user} />;
//   }
//   return <AIMessage message={message} isLoading={isLoading} />;
// }

// export default function Chat() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);

//   const isMountedRef = useRef(true);
//   const loadedThreadRef = useRef<string | null>(null);

//   const scrollContainerRef = useRef<HTMLDivElement | null>(null);
//   const userScrolledUp = useRef(false);
//   const lastScrollTop = useRef(0);

//   const currentThreadId = useConversationStore((s) => s.currentThreadId);
//   const messages = useConversationStore((s) => s.messages) ?? EMPTY_MESSAGES;

//   const storeRef = useRef(useConversationStore.getState());

//   const user = useUserStore((s) => s.user);
//   const initialized = useUserStore((s) => s.initialized);
//   const mode = useAgentStore((s) => s.mode);

//   const router = useRouter();
//   const params = useParams();

//   // ── Auth guard ────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!initialized) return;
//     if (!user) router.push("/auth");
//   }, [initialized, user, router]);

//   // ── Keep storeRef in sync without causing re-renders ─────────────────────
//   useEffect(() => {
//     const unsub = useConversationStore.subscribe(
//       (state) => { storeRef.current = state; }
//     );
//     return () => unsub();
//   }, []);

//   // ── Unmount cleanup ───────────────────────────────────────────────────────
//   useEffect(() => {
//     isMountedRef.current = true;
//     return () => { isMountedRef.current = false; };
//   }, []);

//   // ── Thread init from URL params ───────────────────────────────────────────
//   useEffect(() => {
//     const rawThreadId = params?.thread_id;
//     const paramThreadId = Array.isArray(rawThreadId) ? rawThreadId[0] : rawThreadId;

//     if (typeof paramThreadId === "string") {
//       if (loadedThreadRef.current === paramThreadId) return;
//       loadedThreadRef.current = paramThreadId;
//       storeRef.current.setCurrentThread(paramThreadId);
//       storeRef.current
//         .getMessagesByThreadId(paramThreadId)
//         .catch((e) => console.error("Failed to load messages:", e));
//       return;
//     }

//     if (!storeRef.current.currentThreadId) {
//       storeRef.current.createConversation("New Chat");
//     }
//   }, [params?.thread_id]);

//   // ── Scroll: detect manual scroll up ──────────────────────────────────────
//   useEffect(() => {
//     const container = scrollContainerRef.current;
//     if (!container) return;

//     const handleScroll = () => {
//       const { scrollTop, scrollHeight, clientHeight } = container;
//       const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
//       if (scrollTop < lastScrollTop.current && !isAtBottom) {
//         userScrolledUp.current = true;
//       }
//       if (isAtBottom) {
//         userScrolledUp.current = false;
//       }
//       lastScrollTop.current = scrollTop;
//     };

//     container.addEventListener("scroll", handleScroll, { passive: true });
//     return () => container.removeEventListener("scroll", handleScroll);
//   }, []);

//   // ── Scroll: follow stream ─────────────────────────────────────────────────
//   useEffect(() => {
//     if (userScrolledUp.current) return;
//     const container = scrollContainerRef.current;
//     if (!container) return;
//     container.scrollTop = container.scrollHeight;
//   }, [messages]);

//   // ── Scroll: snap to bottom when stream ends ───────────────────────────────
//   useEffect(() => {
//     if (!isLoading) {
//       userScrolledUp.current = false;
//       const container = scrollContainerRef.current;
//       if (container) container.scrollTop = container.scrollHeight;
//     }
//   }, [isLoading]);

//   // ── Main submit handler ───────────────────────────────────────────────────
//   // const handleSubmit = async ({ input }: handleSubmitParameter) => {
//   //   const {
//   //     createConversation,
//   //     addMessage,
//   //     appendAssistantMessage,
//   //     appendAssistantReasoning, // ← now destructured
//   //     setLastAssistantContent,
//   //     appendVerboseStep,
//   //     setThinkingDone,
//   //     setFinalBlogPost
//   //   } = storeRef.current;

//   //   let threadId = storeRef.current.currentThreadId;
//   //   if (!threadId) {
//   //     threadId = createConversation("new Chat");
//   //     await new Promise((r) => setTimeout(r, 0));
//   //   }

//   //   setIsLoading(true);

//   //   const userMsg: Message = {
//   //     id: crypto.randomUUID(),
//   //     role: "user",
//   //     content: input,
//   //     timestamp: Date.now(),
//   //   };
//   //   addMessage(threadId, userMsg);

//   //   let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

//   //   try {
//   //     const res = await fetch(
//   //       `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}/generate/${threadId}`,
//   //       {
//   //         method: "POST",
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //           Authorization: `Bearer ${useUserStore.getState().jwtToken}`,
//   //         },
//   //         body: JSON.stringify({ user_query: input, mode }),
//   //       }
//   //     );

//   //     if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
//   //     if (!res.body) throw new Error("No response body");

//   //     // Add the assistant placeholder only after we know the request succeeded
//   //     const assistantMsg: Message = {
//   //       id: crypto.randomUUID(),
//   //       role: "assistant",
//   //       content: "",
//   //       timestamp: Date.now(),
//   //     };
//   //     addMessage(threadId, assistantMsg);

//   //     reader = res.body.getReader();
//   //     const decoder = new TextDecoder();
//   //     let buffer = "";
//   //     let renderBuffer = "";
//   //     let reasoningBuffer = "";
//   //     let firstTokenReceived = false;
//   //     let streamError = false;

//   //     while (true) {
//   //       const { done, value } = await reader.read();
//   //       if (done) break;

//   //       buffer += decoder.decode(value, { stream: true });
//   //       const lines = buffer.split("\n");
//   //       buffer = lines.pop() ?? "";

//   //       for (const line of lines) {
//   //         if (!line.startsWith("data: ")) continue;

//   //         let data: any;
//   //         try {
//   //           data = JSON.parse(line.slice(6));
//   //         } catch {
//   //           continue;
//   //         }

//   //         if (data.type === "verbose" && data.content) {
//   //           const step: VerboseStep = {
//   //             content: data.content,
//   //             detail: data.detail ?? null,
//   //             id: "",
//   //             state: "active"
//   //           }; 
//   //           appendVerboseStep(threadId, step);

//   //         } else if (data.type === "token" && data.content) {
//   //           if (!firstTokenReceived) {
//   //             firstTokenReceived = true;
//   //             setThinkingDone(threadId);
//   //           }
//   //           renderBuffer += data.content;
//   //           if (renderBuffer.includes("\n")) {
//   //             appendAssistantMessage(threadId, renderBuffer);
//   //             renderBuffer = "";
//   //           }

//   //         } else if (data.type === "reasoning" && data.content) {
//   //           if (!firstTokenReceived) {
//   //             firstTokenReceived = true;
//   //             setThinkingDone(threadId);
//   //           }
//   //           reasoningBuffer += data.content;
//   //           if (reasoningBuffer.includes("\n") || reasoningBuffer.length > 200) {
//   //             appendAssistantReasoning(threadId, reasoningBuffer);
//   //             reasoningBuffer = "";
//   //           }

//   //         } else if (data.type === "result") {
//   //           // Flush buffers before applying final state
//   //           if (renderBuffer) { appendAssistantMessage(threadId, renderBuffer); renderBuffer = ""; }
//   //           if (reasoningBuffer) { appendAssistantReasoning(threadId, reasoningBuffer); reasoningBuffer = ""; }

//   //           if (mode === "generate" && data.final_blog) {
//   //             setFinalBlogPost(threadId, data.final_blog);
//   //           } 
//   //           if (data.response) {
//   //             setLastAssistantContent(threadId, data.response);
//   //           }
//   //           setThinkingDone(threadId); // ensure thinking panel closes even if no tokens came

//   //         } else if (data.type === "error") {
//   //           console.error("Stream error from server:", data.detail);
//   //           if (renderBuffer) { appendAssistantMessage(threadId, renderBuffer); renderBuffer = ""; }
//   //           setLastAssistantContent(threadId, "An error occurred while generating the response.");
//   //           setThinkingDone(threadId);
//   //           streamError = true;
//   //           break;
//   //         }
//   //       }

//   //       if (streamError) break;
//   //     }

//   //     // Flush any remaining buffered content
//   //     if (renderBuffer) appendAssistantMessage(threadId, renderBuffer);
//   //     if (reasoningBuffer) appendAssistantReasoning(threadId, reasoningBuffer);

//   //   } catch (err) {
//   //     if (reader) {
//   //       try { reader.cancel(); } catch (_) { }
//   //     }
//   //     console.error("Stream error:", err);
//   //   } finally {
//   //     if (isMountedRef.current) setIsLoading(false);
//   //   }
//   // };

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <div className="flex h-screen w-full overflow-hidden">

//       {/* Sidebar */}
//       <div
//         className={`shrink-0 transition-all duration-300 z-20 ${sidebarOpen ? "md:w-72" : "w-0 md:w-16 h-screen"
//           }`}
//       >
//         <ChatSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//       </div>

//       {/* Chat area */}
//       <div className="flex flex-col flex-1 bg-white">

//         {/* Message list */}
//         <div
//           ref={scrollContainerRef}
//           className="flex-1 mt-16 md:mt-6 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-6 flex flex-col"
//         >
//           {messages.length === 0 ? (

//             <div className="flex flex-col items-center justify-center h-full opacity-80">
//               <Image
//                 src="/Loomora_full_removebg.png"
//                 alt="logo"
//                 width={340}
//                 height={200}
//                 className="mb-6 select-none"
//               />
//               <div className="-mt-6">
//                 <h1 className="text-5xl font-Geist">
//                   HI,{" "}
//                   <span className="capitalize ml-2 text-indigo-600">
//                     {user?.name || "there"}
//                   </span>
//                 </h1>
//               </div>
//             </div>

//           ) : (

//             <div className="w-full md:w-full lg:w-3xl mx-auto flex flex-col gap-4">
//               {messages.map((msg, index) => {
//                 const isLastMessage = index === messages.length - 1;
//                 const showLoading =
//                   isLoading && isLastMessage && msg.role === "assistant";
//                 return (
//                   <MessageRenderer
//                     key={msg.id}
//                     message={msg}
//                     user={user}
//                     isLoading={showLoading}
//                   />
//                 );
//               })}
//             </div>

//           )}
//         </div>

//         {/* Input bar */}
//         <div className="bg-white px-4 py-4">
//           <div className="max-w-3xl mx-auto">
//             <div className="rounded-2xl bg-[#efeff0] px-4 py-3 shadow-sm">
//               <ChatInterface onSubmit={handleSubmit} isLoading={isLoading} />
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }


// app/.../page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ChatInterface from "@/components/chat.interface";
import ChatSidebar from "@/components/chat.sidebar";
import { useConversationStore } from "@/stores/conversationStore";
import type { Message } from "@/interfaces/conversation.interface";
import { useUserStore } from "@/stores/userStore";
import { useRouter, useParams } from "next/navigation";
import AIMessage from "@/components/chat.assissant.message";
import UserMessage from "@/components/chat.user.message";
import { useChat } from "@/hooks/useChat";  // ← only new import

const EMPTY_MESSAGES: Message[] = [];

interface Props {
  message: any;
  user: any;
  isLoading?: boolean;
}

function MessageRenderer({ message, user, isLoading }: Props) {
  if (message.role === "user") {
    return <UserMessage message={message} user={user} />;
  }
  return <AIMessage message={message} isLoading={isLoading} />;
}

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Replaced: isLoading, isMountedRef, storeRef, mode, and their effects ──
  const { handleSubmit, isLoading, handleStop } = useChat();

  const loadedThreadRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const userScrolledUp = useRef(false);
  const lastScrollTop = useRef(0);

  const messages = useConversationStore((s) => s.messages) ?? EMPTY_MESSAGES;
  const storeRef = useRef(useConversationStore.getState());

  const user = useUserStore((s) => s.user);
  const initialized = useUserStore((s) => s.initialized);

  const router = useRouter();
  const params = useParams();

  // ── Keep storeRef in sync (still needed for thread init) ─────────────────
  useEffect(() => {
    const unsub = useConversationStore.subscribe(
      (state) => { storeRef.current = state; }
    );
    return () => unsub();
  }, []);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialized) return;
    if (!user) router.push("/auth");
  }, [initialized, user, router]);

  // ── Thread init from URL params ───────────────────────────────────────────
  useEffect(() => {
    const rawThreadId = params?.thread_id;
    const paramThreadId = Array.isArray(rawThreadId) ? rawThreadId[0] : rawThreadId;

    if (typeof paramThreadId === "string") {
      if (loadedThreadRef.current === paramThreadId) return;
      loadedThreadRef.current = paramThreadId;
      storeRef.current.setCurrentThread(paramThreadId);
      storeRef.current
        .getMessagesByThreadId(paramThreadId)
        .catch((e) => console.error("Failed to load messages:", e));
      return;
    }

    if (!storeRef.current.currentThreadId) {
      storeRef.current.createConversation("New Chat");
    }
  }, [params?.thread_id]);

  // ── Scroll: detect manual scroll up ──────────────────────────────────────
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
      if (scrollTop < lastScrollTop.current && !isAtBottom) {
        userScrolledUp.current = true;
      }
      if (isAtBottom) {
        userScrolledUp.current = false;
      }
      lastScrollTop.current = scrollTop;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Scroll: follow stream ─────────────────────────────────────────────────
  useEffect(() => {
    if (userScrolledUp.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  // ── Scroll: snap to bottom when stream ends ───────────────────────────────
  useEffect(() => {
    if (!isLoading) {
      userScrolledUp.current = false;
      const container = scrollContainerRef.current;
      if (container) container.scrollTop = container.scrollHeight;
    }
  }, [isLoading]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* Sidebar */}
      <div
        className={`shrink-0 transition-all duration-300 z-20 ${
          sidebarOpen ? "md:w-72" : "w-0 md:w-16 h-screen"
        }`}
      >
        <ChatSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Chat area */}
      <div className="flex flex-col flex-1 bg-white">

        {/* Message list */}
        <div
          ref={scrollContainerRef}
          className="flex-1 mt-16 md:mt-6 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-6 flex flex-col"
        >
          {messages.length === 0 ? (

            <div className="flex flex-col items-center justify-center h-full opacity-80">
              <Image
                src="/Loomora_full_removebg.png"
                alt="logo"
                width={340}
                height={200}
                className="mb-6 select-none"
              />
              <div className="-mt-6">
                <h1 className="text-5xl font-Geist">
                  HI,{" "}
                  <span className="capitalize ml-2 text-indigo-600">
                    {user?.name || "there"}
                  </span>
                </h1>
              </div>
            </div>

          ) : (

            <div className="w-full md:w-full lg:w-3xl mx-auto flex flex-col gap-4">
              {messages.map((msg, index) => {
                const isLastMessage = index === messages.length - 1;
                const showLoading =
                  isLoading && isLastMessage && msg.role === "assistant";
                return (
                  <MessageRenderer
                    key={msg.id ?? index}  // ← use checkpoint_id as key if available
                    message={msg}
                    user={user}
                    isLoading={showLoading}
                  />
                );
              })}
            </div>

          )}
        </div>

        {/* Input bar */}
        <div className="bg-white px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl bg-[#efeff0] px-4 py-3 shadow-sm">
              <ChatInterface onSubmit={handleSubmit} onStop={handleStop} isLoading={isLoading} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}