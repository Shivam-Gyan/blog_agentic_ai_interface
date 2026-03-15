// // "use client";

// // import { useEffect, useRef, useState } from "react";
// // import Image from "next/image";
// // import ChatInterface from "@/components/chat.interface";
// // import ChatSidebar from "@/components/chat.sidebar";
// // import { useConversationStore } from "@/stores/conversationStore";
// // import { useAgentStore } from "@/stores/agentStore";
// // import type { handleSubmitParameter } from "@/interfaces/chat.interface";
// // import type { Message } from "@/interfaces/conversation.interface";
// // import { useUserStore } from "@/stores/userStore";
// // import { useRouter, useParams } from "next/navigation";
// // import AIMessage from "@/components/chat.assissant.message";
// // import UserMessage from "@/components/chat.user.message";

// // const EMPTY_MESSAGES: Message[] = [];

// // interface Props {
// //   message: any;
// //   user: any;
// //   isLoading?: boolean;
// // }
// // //  rendering the message display logic 
// // function MessageRenderer({ message, user, isLoading }: Props) {

// //   if (message.role === "user") {
// //     return <UserMessage message={message} user={user} />;
// //   }

// //   return <AIMessage message={message} isLoading={isLoading} />;
// // }

// // export default function Chat() {
// //   const [sidebarOpen, setSidebarOpen] = useState(true);
// //   const [isLoading, setIsLoading] = useState(false);

// //   const currentThreadId = useConversationStore((s) => s.currentThreadId);
// //   const createConversation = useConversationStore((s) => s.createConversation);
// //   const setCurrentThread = useConversationStore((s) => s.setCurrentThread);
// //   const getMessagesByThreadId = useConversationStore((s) => s.getMessagesByThreadId);
// //   const addMessage = useConversationStore((s) => s.addMessage);
// //   const appendAssistant = useConversationStore((s) => s.appendAssistantMessage);
// //   const setLastAssistantContent = useConversationStore((s) => s.setLastAssistantContent);
// //   const messages = useConversationStore((s) => s.messages) || EMPTY_MESSAGES;
// //   const user = useUserStore((s) => s.user);
// //   const initialized = useUserStore((s) => s.initialized);
// //   const router = useRouter();
// //   const params = useParams();
// //   const mode = useAgentStore((s) => s.mode);

// //   // Ensure at least one conversation exists on first load
// //   useEffect(() => {
// //     const rawThreadId = params?.thread_id;
// //     const paramThreadId = Array.isArray(rawThreadId) ? rawThreadId[0] : rawThreadId;

// //     // If there's a thread_id in the URL, select it and load messages
// //     if (typeof paramThreadId === "string") {
// //       if (paramThreadId !== currentThreadId) {
// //         setCurrentThread(paramThreadId);
// //         getMessagesByThreadId(paramThreadId).catch((e) => console.error(e));
// //       }
// //       return;
// //     }

// //     // Otherwise ensure at least one conversation exists
// //     if (!currentThreadId) {
// //       createConversation("New Chat");
// //     }

// //   }, [currentThreadId, createConversation, params, setCurrentThread, getMessagesByThreadId]);



// //   // Smart auto-scroll logic using the scroll container ref
// //   const scrollContainerRef = useRef<HTMLDivElement | null>(null);
// //   const userScrolledUp = useRef(false);
// //   const lastScrollTop = useRef(0);

// // // Detect if user manually scrolled up — if so, stop auto-scrolling
// // useEffect(() => {
// //   const container = scrollContainerRef.current;
// //   if (!container) return;

// //   const handleScroll = () => {
// //     const { scrollTop, scrollHeight, clientHeight } = container;
// //     const isAtBottom = scrollHeight - scrollTop - clientHeight < 80; // 80px threshold

// //     if (scrollTop < lastScrollTop.current && !isAtBottom) {
// //       // User scrolled up manually
// //       userScrolledUp.current = true;
// //     }

// //     if (isAtBottom) {
// //       // User scrolled back to bottom — re-enable auto-scroll
// //       userScrolledUp.current = false;
// //     }

// //     lastScrollTop.current = scrollTop;
// //   };

// //   container.addEventListener("scroll", handleScroll, { passive: true });
// //   return () => container.removeEventListener("scroll", handleScroll);
// // }, []);

// // // Smooth scroll only when streaming and user hasn't scrolled up
// // useEffect(() => {
// //   if (userScrolledUp.current) return;

// //   const container = scrollContainerRef.current;
// //   if (!container) return;

// //   // Use scrollTop directly — NO scrollIntoView (that causes the jiggle)
// //   container.scrollTop = container.scrollHeight;
// // }, [messages]);

// // // When loading stops, always scroll to bottom once
// // useEffect(() => {
// //   if (!isLoading) {
// //     userScrolledUp.current = false;
// //     const container = scrollContainerRef.current;
// //     if (container) {
// //       container.scrollTop = container.scrollHeight;
// //     }
// //   }
// // }, [isLoading]);



// //   useEffect(() => {
// //     if (!initialized) return; // wait for auth hydration to complete
// //     if (!user) { router.push("/auth"); return; } // not logged in
// //   }, [initialized, user, router]);

// //   const handleSubmit = async ({ input }: handleSubmitParameter) => {
// //     const threadId = currentThreadId ?? createConversation("New Chat");
// //     setIsLoading(true);

// //     const userMsg: Message = {
// //       id: crypto.randomUUID(),
// //       role: "user",
// //       content: input,
// //       timestamp: Date.now(),
// //     };

// //     const assistantMsg: Message = {
// //       id: crypto.randomUUID(),
// //       role: "assistant",
// //       content: "",
// //       timestamp: Date.now(),
// //     };

// //     addMessage(threadId, userMsg);
// //     addMessage(threadId, assistantMsg);

// //     try {
// //       const res = await fetch(
// //         `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}/generate/${threadId}`,
// //         {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json", "Authorization": `Bearer ${useUserStore.getState().jwtToken}` },
// //           body: JSON.stringify({
// //             user_query: input,
// //             mode: mode,
// //           }),
// //         }
// //       );

// //       if (!res.body) return;

// //       const reader = res.body.getReader();
// //       const decoder = new TextDecoder();
// //       // console.log(reader,decoder)
// //       let buffer = "";
// //       let renderBuffer = "";

// //       while (true) {
// //         const { done, value } = await reader.read();
// //         if (done) break;
// //         // console.log("Received chunk:", value);
// //         // console.log("Decoded chunk:", decoder.decode(value));
// //         buffer += decoder.decode(value, { stream: true });
// //         const lines = buffer.split("\n");
// //         buffer = lines.pop() ?? "";

// //         for (const line of lines) {
// //           if (!line.startsWith("data: ")) continue;

// //           const data = JSON.parse(line.slice(6));

// //           if (data.type === "token" && data.content) {
// //             renderBuffer += data.content;
// //             // Batch re-renders on newlines for performance (original behaviour)
// //             if (renderBuffer.includes("\n")) {
// //               appendAssistant(threadId, renderBuffer);
// //               renderBuffer = "";
// //             }
// //           } else if (data.type === "result" && data.content) {
// //             // Final consolidated response — replace any streamed content
// //             setLastAssistantContent(threadId, data.content);
// //             renderBuffer = "";
// //           }
// //         }
// //       }

// //       // Flush any remaining buffered tokens
// //       if (renderBuffer) appendAssistant(threadId, renderBuffer);

// //     } catch (err) {
// //       console.error("Stream error:", err);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };


// //   return (
// //     <div className="flex h-screen w-full overflow-hidden">

// //       {/* Sidebar */}
// //       <div
// //         className={`shrink-0 transition-all duration-300 z-20 ${sidebarOpen ? "md:w-72" : " w-0 md:w-16 h-screen"
// //           }`}
// //       >
// //         <ChatSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// //       </div>

// //       {/* Chat Area */}
// //       <div className="flex flex-col flex-1 bg-white">
// //         {/* Messages */}
// //         <div ref={scrollContainerRef} className="flex-1 mt-16 md:mt-6 min-h-0 overflow-y-auto px-6 py-6 flex flex-col">

// //           {messages.length === 0 ? (

// //             <div className="flex flex-col items-center justify-center h-full opacity-80">
// //               <Image
// //                 src="/Loomora_full_removebg.png"
// //                 alt="logo"
// //                 width={340}
// //                 height={200}
// //                 className="mb-6 select-none"
// //               />

// //               <div className="-mt-6">
// //                 <h1 className="text-5xl font-Geist">HI, 
// //                   <span className="capitalize ml-2 text-indigo-600">{user?.name || "there"}</span>
// //                    </h1>
// //               </div>
// //             </div>

// //           ) : (

// //             <div className="w-full md:w-[80%] lg:w-3xl mx-auto flex flex-col gap-4">

// //               {messages.map((msg, index) => {
// //                 const isLastMessage = index === messages.length - 1;
// //                 const showLoading = isLoading && isLastMessage && msg.role === "assistant";

// //                 return (
// //                   <MessageRenderer
// //                     key={msg.id}
// //                     message={msg}
// //                     user={user}
// //                     isLoading={showLoading}  // ← only true for the last assistant msg
// //                   />
// //                 );
// //               })}

// //               {/* {isLoading && (
// //                 <div className="flex justify-start">
// //                   <div className="px-4 py-3 rounded-xl bg-gray-100 text-sm">
// //                     Thinking...
// //                   </div>
// //                 </div>
// //               )} */}



// //             </div>

// //           )}

// //         </div>

// //         {/* Chat Input */}
// //         <div className="bg-white px-4 py-4">
// //           <div className="max-w-3xl mx-auto">
// //             <div className="rounded-2xl bg-[#efeff0] px-4 py-3 shadow-sm">
// //               <ChatInterface onSubmit={handleSubmit} isLoading={isLoading} />
// //             </div>
// //           </div>
// //         </div>

// //       </div>

// //     </div>
// //   );
// // }


// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import Image from "next/image";
// import ChatInterface from "@/components/chat.interface";
// import ChatSidebar from "@/components/chat.sidebar";
// import { useConversationStore } from "@/stores/conversationStore";
// import { useAgentStore } from "@/stores/agentStore";
// import type { handleSubmitParameter } from "@/interfaces/chat.interface";
// import type { Message } from "@/interfaces/conversation.interface";
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

//   // ✅ Bug 2 fix: track mount state
//   const isMountedRef = useRef(true);
//   // ✅ Bug 1 fix: track which thread has already been loaded
//   const loadedThreadRef = useRef<string | null>(null);

//   // Scroll refs
//   const scrollContainerRef = useRef<HTMLDivElement | null>(null);
//   const userScrolledUp = useRef(false);
//   const lastScrollTop = useRef(0);

//   // Zustand — select primitives and functions separately
//   const currentThreadId = useConversationStore((s) => s.currentThreadId);
//   const messages = useConversationStore((s) => s.messages) ?? EMPTY_MESSAGES;

//   // ✅ Bug 1 fix: pull store actions once via getState() to get stable references
//   const storeRef = useRef(useConversationStore.getState());

//   const user = useUserStore((s) => s.user);
//   const initialized = useUserStore((s) => s.initialized);
//   const mode = useAgentStore((s) => s.mode);

//   const router = useRouter();
//   const params = useParams();



//   // Auth guard
//   useEffect(() => {
//     if (!initialized) return;
//     if (!user) router.push("/auth");
//   }, [initialized, user, router]);

//   // Keep storeRef in sync without causing re-renders
//   useEffect(() => {
//     const unsub = useConversationStore.subscribe(
//       (state) => { storeRef.current = state; }
//     );
//     return () => unsub();
//   }, []);

//   // Unmount cleanup
//   useEffect(() => {
//     isMountedRef.current = true; // ← add this line
//     return () => { isMountedRef.current = false; };
//   }, []);

//   useEffect(() => {
//     const rawThreadId = params?.thread_id;
//     const paramThreadId = Array.isArray(rawThreadId) ? rawThreadId[0] : rawThreadId;

//     if (typeof paramThreadId === "string") {
//       // Guard: skip if this thread is already loaded
//       if (loadedThreadRef.current === paramThreadId) return;
//       loadedThreadRef.current = paramThreadId;

//       storeRef.current.setCurrentThread(paramThreadId);
//       storeRef.current.getMessagesByThreadId(paramThreadId).catch((e) =>
//         console.error("Failed to load messages:", e)
//       );
//       return;
//     }

//     // No thread_id in URL — ensure at least one conversation exists
//     if (!storeRef.current.currentThreadId) {
//       storeRef.current.createConversation("New Chat");
//     }
//   }, [params?.thread_id]); // only the URL param as dep



//   // Scroll: detect manual scroll up
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

//   // Scroll: follow stream if user hasn't scrolled up
//   useEffect(() => {
//     if (userScrolledUp.current) return;
//     const container = scrollContainerRef.current;
//     if (!container) return;
//     container.scrollTop = container.scrollHeight;
//   }, [messages]);

//   // Scroll: snap to bottom when stream ends
//   useEffect(() => {
//     if (!isLoading) {
//       userScrolledUp.current = false;
//       const container = scrollContainerRef.current;
//       if (container) container.scrollTop = container.scrollHeight;
//     }
//   }, [isLoading]);

//   // ✅ SIMPLEST FIX: plain async function, no useCallback
//   const handleSubmit = async ({ input }: handleSubmitParameter) => {
//     const { createConversation, addMessage, appendAssistantMessage, setLastAssistantContent } = storeRef.current;

//     let threadId = storeRef.current.currentThreadId;
//     if (!threadId) {
//       threadId = createConversation("New Chat");
//       await new Promise((r) => setTimeout(r, 0));
//     }

//     setIsLoading(true); // ← always fresh, no closure issue

//     const userMsg: Message = {
//       id: crypto.randomUUID(),
//       role: "user",
//       content: input,
//       timestamp: Date.now(),
//     };

//     addMessage(threadId, userMsg);

//     let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}/generate/${threadId}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${useUserStore.getState().jwtToken}`,
//           },
//           body: JSON.stringify({ user_query: input, mode }),
//         }
//       );

//       if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
//       if (!res.body) throw new Error("No response body");

//       const assistantMsg: Message = {
//         id: crypto.randomUUID(),
//         role: "assistant",
//         content: "",
//         timestamp: Date.now(),
//       };
//       addMessage(threadId, assistantMsg);

//       reader = res.body.getReader();
//       const decoder = new TextDecoder();
//       let buffer = "";
//       let renderBuffer = "";

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;

//         buffer += decoder.decode(value, { stream: true });
//         const lines = buffer.split("\n");
//         buffer = lines.pop() ?? "";

//         for (const line of lines) {
//           if (!line.startsWith("data: ")) continue;
//           const data = JSON.parse(line.slice(6));

//           // In your handleSubmit stream loop:
//           if (data.type === "token" && data.content) {
//             renderBuffer += data.content;
//             if (renderBuffer.includes("\n")) {
//               appendAssistantMessage(threadId, renderBuffer);
//               renderBuffer = "";
//             }
//           } else if (data.type === "reasoning" && data.content) {
//             // append to a separate reasoning field on the message
//             appendAssistantReasoning(threadId, data.content);
//           } else if (data.type === "result" && data.content) {
//             setLastAssistantContent(threadId, data.content);
//             renderBuffer = "";
//           }
//         }
//       }

//       if (renderBuffer) appendAssistantMessage(threadId, renderBuffer);

//     } catch (err) {
//       if (reader) {
//         try { reader.cancel(); } catch (_) { }
//       }
//       console.error("Stream error:", err);
//     } finally {
//       // ✅ Always runs, always has fresh setIsLoading reference
//       if (isMountedRef.current) setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex h-screen w-full overflow-hidden">

//       {/* Sidebar */}
//       <div
//         className={`shrink-0 transition-all duration-300 z-20 ${sidebarOpen ? "md:w-72" : "w-0 md:w-16 h-screen"
//           }`}
//       >
//         <ChatSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//       </div>

//       {/* Chat Area */}
//       <div className="flex flex-col flex-1 bg-white">

//         {/* Messages */}
//         <div
//           ref={scrollContainerRef}
//           className="flex-1 mt-16 md:mt-6 min-h-0 overflow-y-auto px-6 py-6 flex flex-col"
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

//             <div className="w-full md:w-[80%] lg:w-3xl mx-auto flex flex-col gap-4">
//               {messages.map((msg, index) => {
//                 const isLastMessage = index === messages.length - 1;
//                 const showLoading = isLoading && isLastMessage && msg.role === "assistant";
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

//         {/* Chat Input */}
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


"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ChatInterface from "@/components/chat.interface";
import ChatSidebar from "@/components/chat.sidebar";
import { useConversationStore } from "@/stores/conversationStore";
import { useAgentStore } from "@/stores/agentStore";
import type { handleSubmitParameter } from "@/interfaces/chat.interface";
import type { Message, VerboseStep } from "@/interfaces/conversation.interface";
import { useUserStore } from "@/stores/userStore";
import { useRouter, useParams } from "next/navigation";
import AIMessage from "@/components/chat.assissant.message";
import UserMessage from "@/components/chat.user.message";

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
  const [isLoading, setIsLoading] = useState(false);

  const isMountedRef = useRef(true);
  const loadedThreadRef = useRef<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const userScrolledUp = useRef(false);
  const lastScrollTop = useRef(0);

  const currentThreadId = useConversationStore((s) => s.currentThreadId);
  const messages = useConversationStore((s) => s.messages) ?? EMPTY_MESSAGES;

  const storeRef = useRef(useConversationStore.getState());

  const user = useUserStore((s) => s.user);
  const initialized = useUserStore((s) => s.initialized);
  const mode = useAgentStore((s) => s.mode);

  const router = useRouter();
  const params = useParams();

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialized) return;
    if (!user) router.push("/auth");
  }, [initialized, user, router]);

  // ── Keep storeRef in sync without causing re-renders ─────────────────────
  useEffect(() => {
    const unsub = useConversationStore.subscribe(
      (state) => { storeRef.current = state; }
    );
    return () => unsub();
  }, []);

  // ── Unmount cleanup ───────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

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

  // ── Main submit handler ───────────────────────────────────────────────────
  const handleSubmit = async ({ input }: handleSubmitParameter) => {
    const {
      createConversation,
      addMessage,
      appendAssistantMessage,
      appendAssistantReasoning, // ← now destructured
      setLastAssistantContent,
      appendVerboseStep,
      setThinkingDone,
      setFinalBlogPost
    } = storeRef.current;

    let threadId = storeRef.current.currentThreadId;
    if (!threadId) {
      threadId = createConversation("new Chat");
      await new Promise((r) => setTimeout(r, 0));
    }

    setIsLoading(true);

    const userMsg: Message = {
      id: crypto.randomUUID(),
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useUserStore.getState().jwtToken}`,
          },
          body: JSON.stringify({ user_query: input, mode }),
        }
      );

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      if (!res.body) throw new Error("No response body");

      // Add the assistant placeholder only after we know the request succeeded
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
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
          try {
            data = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (data.type === "verbose" && data.content) {
            const step: VerboseStep = {
              content: data.content,
              detail: data.detail ?? null,
              id: "",
              state: "active"
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
            // Flush buffers before applying final state
            if (renderBuffer) { appendAssistantMessage(threadId, renderBuffer); renderBuffer = ""; }
            if (reasoningBuffer) { appendAssistantReasoning(threadId, reasoningBuffer); reasoningBuffer = ""; }

            if (mode === "generate" && data.final_blog) {
              setFinalBlogPost(threadId, data.final_blog);
            } 
            if (data.response) {
              setLastAssistantContent(threadId, data.response);
            }
            setThinkingDone(threadId); // ensure thinking panel closes even if no tokens came

          } else if (data.type === "error") {
            console.error("Stream error from server:", data.detail);
            if (renderBuffer) { appendAssistantMessage(threadId, renderBuffer); renderBuffer = ""; }
            setLastAssistantContent(threadId, "An error occurred while generating the response.");
            setThinkingDone(threadId);
            streamError = true;
            break;
          }
        }

        if (streamError) break;
      }

      // Flush any remaining buffered content
      if (renderBuffer) appendAssistantMessage(threadId, renderBuffer);
      if (reasoningBuffer) appendAssistantReasoning(threadId, reasoningBuffer);

    } catch (err) {
      if (reader) {
        try { reader.cancel(); } catch (_) { }
      }
      console.error("Stream error:", err);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* Sidebar */}
      <div
        className={`shrink-0 transition-all duration-300 z-20 ${sidebarOpen ? "md:w-72" : "w-0 md:w-16 h-screen"
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
                    key={msg.id}
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
              <ChatInterface onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}