// import { create } from "zustand";
// import type { Message } from "@/interfaces/conversation.interface";
// import api from "@/services/api";
// import { threadId } from "worker_threads";

// // Matches the backend GET /conversations response shape exactly
// export interface ConversationSummary {
//   thread_id: string;
//   title: string;
//   created_at: string;
//   updated_at: string;
//   is_active: boolean;
//   message_count: number;
// }

// interface ConversationStore {
//   conversations: ConversationSummary[];
//   currentThreadId: string | null;
//   messages: Message[];
//   userPrompts: string[];
//   // setPrompts: (prompt: string | "") => void;
//   getMessagesByThreadId: (threadId: string) => Promise<Message[]>;
//   setConversation: (conversations: ConversationSummary[]) => void;
//   createConversation: (title?: string) => string;
//   setCurrentThread: (threadId: string) => void;
//   addMessage: (threadId: string, message: Message) => void;
//   appendAssistantMessage: (threadId: string, chunk: string) => void;
//   setLastAssistantContent: (threadId: string, content: string) => void;
//   hardDeleteConversation: (threadId: string) => Promise<any>;
//   softDeleteConversation: (threadId: string) => Promise<any>;
// }

// export const useConversationStore = create<ConversationStore>((set) => ({
//   conversations: [],
//   currentThreadId: null,
//   messages: [],
//   userPrompts: [],

//   setConversation: (conversations: ConversationSummary[]) => set({ conversations }),

//   createConversation: (title = "New Conversation") => {
//     const thread_id = crypto.randomUUID();
//     const now = new Date().toISOString();
//     set((state) => ({
//       conversations: [
//         { thread_id, title, created_at: now, updated_at: now, is_active: true, message_count: 0 },
//         ...state.conversations,
//       ],
//       currentThreadId: thread_id,
//       messages: [],
//       userPrompts: [],
//     }));


//     return thread_id;
//   },

//   getMessagesByThreadId: async (threadId) => {
//     try {
//       const conversation = await api.get(`/conversations/${threadId}`);
//       // console.log("Fetched conversation for threadId", threadId, conversation);
//       const rawMessages = conversation?.data?.conversation?.messages ?? [];

//       // Normalize backend shape → frontend Message shape
//       const messages = rawMessages.map((m: { role: string; content: string; timestamp: string }, i: number) => ({
//         id: `${threadId}-${i}`,
//         role: m.role,
//         content: m.content,
//         timestamp: new Date(m.timestamp).getTime(),
//       }));

//       const prompts = conversation?.data?.conversation?.user_prompts ?? [];

//       set({ messages, userPrompts: prompts });
//       return messages;
//     } catch (err: any) {
//       const status = err?.response?.status;
//       // If backend doesn't know about this thread (404), create a local stub so the
//       // thread_id in the URL is visible/selectable after a refresh.
//       if (status === 404) {
//         const now = new Date().toISOString();
//         set((state) => ({
//           conversations: [
//             { thread_id: threadId, title: "New Chat", created_at: now, updated_at: now, is_active: true, message_count: 0 },
//             ...state.conversations,
//           ],
//           currentThreadId: threadId,
//           messages: [],
//         }));
//         return [];
//       }
//       throw err;
//     }
//   },

//   // setPrompts:(prompt:string)=> set((state)=>({userPrompts: prompt.length === 0 ? [] : [...state.userPrompts, prompt]})),


//   setCurrentThread: (threadId) => set({ currentThreadId: threadId }),

//   addMessage: (threadId, message) =>
//     set((state) => ({
//       conversations: state.conversations.map((c) => {
//         if (c.thread_id !== threadId) return c;
//         const isFirstUserMsg = c.message_count === 0 && message.role === "user";
//         return {
//           ...c,
//           message_count: c.message_count + 1,
//           ...(isFirstUserMsg && { title: message.content.slice(0, 50).trim() }),
//         };
//       }),
//       messages: threadId === state.currentThreadId ? [...state.messages, message] : state.messages,
//       userPrompts: threadId === state.currentThreadId &&  message.role === 'user' ? [...state.userPrompts, message.content] : state.userPrompts,
//     })),

//   // Appends a streamed text chunk to the last assistant message in the thread.
//   appendAssistantMessage: (threadId, chunk) =>
//     set((state) => {
//       if (threadId !== state.currentThreadId) return state;
//       const messages = [...state.messages];
//       const lastIdx = messages.length - 1;
//       if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
//         messages[lastIdx] = { ...messages[lastIdx], content: messages[lastIdx].content + chunk };
//       }
//       return { messages };
//     }),

//   // Replaces the last assistant message content (used for final 'result' events)
//   setLastAssistantContent: (threadId, content) =>
//     set((state) => {
//       if (threadId !== state.currentThreadId) return state;
//       const messages = [...state.messages];
//       const lastIdx = messages.length - 1;
//       if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
//         messages[lastIdx] = { ...messages[lastIdx], content };
//       }
//       const now = new Date().toISOString();
//       return {
//         messages,
//         conversations: state.conversations.map((c) =>
//           c.thread_id === threadId
//             ? { ...c, message_count: c.message_count + 1, updated_at: now }
//             : c
//         ),
//       };
//     }),

//   softDeleteConversation: async (threadId) =>{
//     set((state) => {
//       const filtered = state.conversations.filter(
//         (c) => c.thread_id !== threadId
//       );
//       return {
//         conversations: filtered,
//         currentThreadId:
//           state.currentThreadId === threadId
//             ? (filtered[0]?.thread_id ?? null)
//             : state.currentThreadId,
//       };
//     });

//     //  set conversation is_active: false in backend
//     // logic here 

//     const response = await api.delete(`/conversations/soft-delete/${threadId}`);

//     // console.log("Soft delete response for threadId", threadId, response);

//     return response;
//   },

//   hardDeleteConversation: async(threadId) => {
//     set((state) => {
//       const filtered = state.conversations.filter(
//         (c) => c.thread_id !== threadId
//       );
//       return {  
//         conversations: filtered,
//         currentThreadId:
//           state.currentThreadId === threadId
//             ? (filtered[0]?.thread_id ?? null)
//             : state.currentThreadId,
//       };
//     });

//     // hard delete from backend
//     const response = await api.delete(`/conversations/hard-delete/${threadId}`);
//     // console.log("Hard delete response for threadId", threadId, response);

//     return response.data;
//   }

// }));



// import { create } from "zustand";
// import type { Message, VerboseStep } from "@/interfaces/conversation.interface";
// import api from "@/services/api";

// // Matches the backend GET /conversations response shape exactly
// export interface ConversationSummary {
//   thread_id: string;
//   title: string;
//   created_at: string;
//   updated_at: string;
//   is_active: boolean;
//   message_count: number;
// }



// interface ConversationStore {
//   conversations: ConversationSummary[];
//   currentThreadId: string | null;
//   messages: Message[];
//   userPrompts: string[];

//   getMessagesByThreadId: (threadId: string) => Promise<Message[]>;
//   setConversation: (conversations: ConversationSummary[]) => void;
//   createConversation: (title?: string) => string;
//   setCurrentThread: (threadId: string) => void;
//   addMessage: (threadId: string, message: Message, checkpointId?: string | null ) => void;
//   appendAssistantMessage: (threadId: string, chunk: string) => void;
//   appendVerboseStep: (threadId: string, step: VerboseStep) => void;
//   setThinkingDone: (threadId: string) => void;
//   setFinalBlogPost: (threadId: string, content: string) => void;
//   appendAssistantReasoning: (threadId: string, chunk: string) => void;
//   setLastAssistantContent: (threadId: string, content: string, checkpointId?: string | null) => void;
//   hardDeleteConversation: (threadId: string) => Promise<any>;
//   softDeleteConversation: (threadId: string) => Promise<any>;
// }

// export const useConversationStore = create<ConversationStore>((set) => ({
//   conversations: [],
//   currentThreadId: null,
//   messages: [],
//   userPrompts: [],

//   setConversation: (conversations) => set({ conversations }),

//   createConversation: (title = "New Conversation") => {
//     const thread_id = crypto.randomUUID();
//     const now = new Date().toISOString();
//     set((state) => ({
//       conversations: [
//         {
//           thread_id,
//           title,
//           created_at: now,
//           updated_at: now,
//           is_active: true,
//           message_count: 0,
//         },
//         ...state.conversations,
//       ],
//       currentThreadId: thread_id,
//       messages: [],
//       userPrompts: [],
//     }));
//     return thread_id;
//   },

//   getMessagesByThreadId: async (threadId) => {
//     try {
//       const conversation = await api.get(`/conversations/${threadId}`);
//       const rawMessages = conversation?.data?.conversation?.messages ?? [];
//       // console.log("Fetched conversation for threadId", threadId, conversation);
//       const messages: Message[] = rawMessages.map(
//         (m: { role: string; content: string; final_blog?: string; timestamp: string, checkpoint_id?: string | null }, i: number) => ({
//           id: `${threadId}-${i}`,
//           role: m.role,
//           content: m.content,
//           timestamp: new Date(m.timestamp).getTime(),
//           final_blog_post: m.final_blog || undefined,
//           checkpoint_id: m.checkpoint_id ?? null, 
//           reasoning: undefined,
//         })
//       );

//       const prompts = conversation?.data?.conversation?.user_prompts ?? [];
//       set({ messages, userPrompts: prompts });
//       return messages;
//     } catch (err: any) {
//       const status = err?.response?.status;
//       if (status === 404) {
//         useConversationStore.getState().createConversation("New Chat");
//         // const now = new Date().toISOString();
//         // set((state) => ({
//         //   conversations: [
//         //     {
//         //       thread_id: threadId,
//         //       title: "New Chat",
//         //       created_at: now,
//         //       updated_at: now,
//         //       is_active: true,
//         //       message_count: 0,
//         //     },
//         //     ...state.conversations,
//         //   ],
//         //   currentThreadId: threadId,
//         //   messages: [],
//         // }));
//         // return [];
//       }
//       throw err;
//     }
//   },

//   setCurrentThread: (threadId) => set({ currentThreadId: threadId }),

//   addMessage: (threadId, message, checkpointId = null) =>
//     set((state) => ({
//         conversations: state.conversations.map((c) => {
//           if (c.thread_id !== threadId) return c;
//           const isFirstUserMsg = c.message_count === 0 && message.role === "user";
//           return {
//             ...c,
//             message_count: c.message_count + 1,
//             ...(isFirstUserMsg && { title: message.content.slice(0, 50).trim() }),
//           };
//         }),
//       messages:
//         threadId === state.currentThreadId
//           ? [...state.messages, message]
//           : state.messages,
//       userPrompts:
//         threadId === state.currentThreadId && message.role === "user"
//           ? [...state.userPrompts, message.content]
//           : state.userPrompts,
//     })),

//   // Appends a streamed answer token to the last assistant message
//   appendAssistantMessage: (threadId, chunk) =>
//     set((state) => {
//       if (threadId !== state.currentThreadId) return state;
//       const messages = [...state.messages];
//       const lastIdx = messages.length - 1;
//       if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
//         messages[lastIdx] = {
//           ...messages[lastIdx],
//           content: messages[lastIdx].content + chunk,
//         };
//       }
//       return { messages };
//     }),

//   appendVerboseStep: (threadId: string, step: { content: string; detail?: string | null }) =>
//     set((state) => {
//       if (threadId !== state.currentThreadId) return state;
//       const messages = [...state.messages];
//       const lastIdx = messages.length - 1;
//       if (lastIdx < 0 || messages[lastIdx].role !== "assistant") return state;

//       const prev = messages[lastIdx].verboseSteps ?? [];

//       // Mark all previous steps as done, add new one as active
//       const updated: VerboseStep[] = [
//         ...prev.map(s => ({ ...s, state: "done" as const })),
//         {
//           id: crypto.randomUUID(),
//           content: step.content,
//           detail: step.detail ?? null,
//           state: "active" as const,
//         },
//       ];

//       messages[lastIdx] = { ...messages[lastIdx], verboseSteps: updated };
//       return { messages };
//     }),

//   setThinkingDone: (threadId: string) =>
//     set((state) => {
//       if (threadId !== state.currentThreadId) return state;
//       const messages = [...state.messages];
//       const lastIdx = messages.length - 1;
//       if (lastIdx < 0 || messages[lastIdx].role !== "assistant") return state;

//       const prev = messages[lastIdx].verboseSteps ?? [];
//       messages[lastIdx] = {
//         ...messages[lastIdx],
//         thinkingDone: true,
//         verboseSteps: prev.map(s => ({ ...s, state: "done" as const })),
//       };
//       return { messages };
//     }),

//   setFinalBlogPost: (threadId: string, content: string) =>
//     set((state) => {
//       if (threadId !== state.currentThreadId) return state;
//       const messages = [...state.messages];
//       const lastIdx = messages.length - 1;
//       if (lastIdx < 0 || messages[lastIdx].role !== "assistant") return state;
//       messages[lastIdx] = {
//         ...messages[lastIdx],
//         final_blog_post: content,
//       };
//       return { messages };
//     }),
//   // Appends a streamed reasoning token to the last assistant message's
//   // separate `reasoning` field — never mixed into `content`
//   appendAssistantReasoning: (threadId, chunk) =>
//     set((state) => {
//       if (threadId !== state.currentThreadId) return state;
//       const messages = [...state.messages];
//       const lastIdx = messages.length - 1;
//       if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
//         messages[lastIdx] = {
//           ...messages[lastIdx],
//           reasoning: (messages[lastIdx].reasoning ?? "") + chunk,
//         };
//       }
//       return { messages };
//     }),

//   // Replaces the last assistant message's content with the final result
//   setLastAssistantContent: (threadId, content, checkpointId) =>
//     set((state) => {
//       if (threadId !== state.currentThreadId) return state;
//       const messages = [...state.messages];
//       const lastIdx = messages.length - 1;
//       const secondLastIdx = messages.length - 2;
//       if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
//         messages[lastIdx] = {
//           ...messages[lastIdx],
//           content,
//           ...(checkpointId && { checkpoint_id: checkpointId }),  // ← piggyback here
//         };
//       }
//       if (secondLastIdx >= 0 && messages[secondLastIdx].role === "user") {
//         messages[secondLastIdx] = {
//           ...messages[secondLastIdx],
//           ...(checkpointId && { checkpoint_id: checkpointId }),  // ← piggyback here
//         };
//       }
//       // console.log("secondLastIdx", secondLastIdx, messages[secondLastIdx]);
//       const now = new Date().toISOString();
//       return {
//         messages,
//         conversations: state.conversations.map((c) =>
//           c.thread_id === threadId
//             ? { ...c, message_count: c.message_count + 1, updated_at: now }
//             : c
//         ),
//       };
//     }),

//   softDeleteConversation: async (threadId) => {
//     set((state) => {
//       const filtered = state.conversations.filter((c) => c.thread_id !== threadId);
//       return {
//         conversations: filtered,
//         currentThreadId:
//           state.currentThreadId === threadId
//             ? (filtered[0]?.thread_id ?? null)
//             : state.currentThreadId,
//       };
//     });
//     const response = await api.delete(`/conversations/soft-delete/${threadId}`);
//     return response;
//   },

//   hardDeleteConversation: async (threadId) => {
//     set((state) => {
//       const filtered = state.conversations.filter((c) => c.thread_id !== threadId);
//       return {
//         conversations: filtered,
//         currentThreadId:
//           state.currentThreadId === threadId
//             ? (filtered[0]?.thread_id ?? null)
//             : state.currentThreadId,
//       };
//     });
//     const response = await api.delete(`/conversations/hard-delete/${threadId}`);
//     return response.data;
//   },
// }));


import { create } from "zustand";
import type { Message, ResponseVersion, VerboseStep } from "@/interfaces/conversation.interface";
import api from "@/services/api";

export interface ConversationSummary {
  thread_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  message_count: number;
}



interface ConversationStore {
  conversations: ConversationSummary[];
  currentThreadId: string | null;
  messages: Message[];
  userPrompts: string[];
  switchVersion: (threadId: string, messageId: string, targetIndex: number) => void;

  getMessagesByThreadId: (threadId: string) => Promise<Message[]>;
  setConversation: (conversations: ConversationSummary[]) => void;
  createConversation: (title?: string) => string;
  setCurrentThread: (threadId: string) => void;
  addMessage: (threadId: string, message: Message) => void;
  appendAssistantMessage: (threadId: string, chunk: string) => void;
  appendVerboseStep: (threadId: string, step: VerboseStep) => void;
  setThinkingDone: (threadId: string) => void;
  setFinalBlogPost: (threadId: string, content: string) => void;
  appendAssistantReasoning: (threadId: string, chunk: string) => void;
  prepareEditRetry: (threadId: string, messageId: string, editedContent: string) => void;
  finalizeAssistantMessage: (
    threadId: string,
    content: string,
    editId: string | null,
    retryId: string | null,
    finalCheckpointId: string | null,
  ) => void;
  markAssistantError: (
    threadId: string,
    editId: string | null,
    retryId: string | null,
  ) => void;
  hardDeleteConversation: (threadId: string) => Promise<any>;
  softDeleteConversation: (threadId: string) => Promise<any>;
  appendRetryVersion: (
    threadId: string,
    messageId: string,
    content: string,
    finalCheckpointId: string | null,
    finalBlogPost?: string,
  ) => void;
  resetAssistantForRetry: (threadId: string, messageId: string) => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  conversations: [],
  currentThreadId: null,
  messages: [],
  userPrompts: [],

  setConversation: (conversations) => set({ conversations }),

  createConversation: (title = "New Conversation") => {
    const thread_id = crypto.randomUUID();
    const now = new Date().toISOString();
    set((state) => ({
      conversations: [
        { thread_id, title, created_at: now, updated_at: now, is_active: true, message_count: 0 },
        ...state.conversations,
      ],
      currentThreadId: thread_id,
      messages: [],
      userPrompts: [],
    }));
    return thread_id;
  },

  switchVersion: (threadId, messageId, targetIndex) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const msgIdx = messages.findIndex((m) => m.id === messageId);
      if (msgIdx === -1) return state;

      const msg = messages[msgIdx];
      const versions = msg.versions ?? [];
      if (targetIndex < 0 || targetIndex >= versions.length) return state;

      const targetVersion = versions[targetIndex];
      messages[msgIdx] = {
        ...msg,
        content: targetVersion.content,
        final_blog_post: targetVersion.final_blog_post ?? undefined,
        final_checkpoint_id: targetVersion.final_checkpoint_id ?? null,
        active_version_index: targetIndex,
      };

      return { messages };
    }),

  getMessagesByThreadId: async (threadId) => {
    try {
      const conversation = await api.get(`/conversations/${threadId}`);
      const rawMessages = conversation?.data?.conversation?.messages ?? [];

      const messages: Message[] = rawMessages.map(
        (m: any, i: number) => ({
          id: `${threadId}-${i}`,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp).getTime(),

          // USER fields
          edit_id: m.edit_id ?? null,

          // ASSISTANT fields
          retry_id: m.retry_id ?? null,
          final_checkpoint_id: m.final_checkpoint_id ?? null,
          final_blog_post: m.final_blog ?? undefined,

          // Versions — frontend defaults to showing versions[-1] (latest)
          versions: (m.versions ?? []).map((v: any) => ({
            content: v.content,
            final_checkpoint_id: v.final_checkpoint_id ?? null,
            final_blog_post: v.final_blog ?? undefined,
            timestamp: new Date(v.timestamp).getTime(),
          })) as ResponseVersion[],

          // active_version_index is frontend-only state, default to last version
          active_version_index: m.versions?.length ? m.versions.length - 1 : 0,

          reasoning: undefined,
          verboseSteps: undefined,
          thinkingDone: m.role === "assistant", // already done for loaded messages
        })
      );

      const prompts = conversation?.data?.conversation?.user_prompts ?? [];
      set({ messages, userPrompts: prompts });
      return messages;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        useConversationStore.getState().createConversation("New Chat");
      }
      throw err;
    }
  },

  setCurrentThread: (threadId) => set({ currentThreadId: threadId }),

  addMessage: (threadId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (c.thread_id !== threadId) return c;
        const isFirstUserMsg = c.message_count === 0 && message.role === "user";
        return {
          ...c,
          message_count: c.message_count + 1,
          ...(isFirstUserMsg && { title: message.content.slice(0, 50).trim() }),
        };
      }),
      messages:
        threadId === state.currentThreadId
          ? [...state.messages, message]
          : state.messages,
      userPrompts:
        threadId === state.currentThreadId && message.role === "user"
          ? [...state.userPrompts, message.content]
          : state.userPrompts,
    })),

  appendAssistantMessage: (threadId, chunk) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
        messages[lastIdx] = {
          ...messages[lastIdx],
          content: messages[lastIdx].content + chunk,
        };
      }
      return { messages };
    }),

  appendVerboseStep: (threadId, step) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      if (lastIdx < 0 || messages[lastIdx].role !== "assistant") return state;
      const prev = messages[lastIdx].verboseSteps ?? [];
      messages[lastIdx] = {
        ...messages[lastIdx],
        verboseSteps: [
          ...prev.map((s) => ({ ...s, state: "done" as const })),
          { id: crypto.randomUUID(), content: step.content, detail: step.detail ?? null, state: "active" as const },
        ],
      };
      return { messages };
    }),

  setThinkingDone: (threadId) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      if (lastIdx < 0 || messages[lastIdx].role !== "assistant") return state;
      messages[lastIdx] = {
        ...messages[lastIdx],
        thinkingDone: true,
        verboseSteps: (messages[lastIdx].verboseSteps ?? []).map((s) => ({ ...s, state: "done" as const })),
      };
      return { messages };
    }),

  setFinalBlogPost: (threadId, content) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      if (lastIdx < 0 || messages[lastIdx].role !== "assistant") return state;
      messages[lastIdx] = { ...messages[lastIdx], final_blog_post: content };
      return { messages };
    }),

  appendAssistantReasoning: (threadId, chunk) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
        messages[lastIdx] = {
          ...messages[lastIdx],
          reasoning: (messages[lastIdx].reasoning ?? "") + chunk,
        };
      }
      return { messages };
    }),

  prepareEditRetry: (threadId, messageId, editedContent) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;

      const messageIndex = state.messages.findIndex((message) => message.id === messageId);
      if (messageIndex === -1) return state;

      const targetMessage = state.messages[messageIndex];
      if (targetMessage.role !== "user") return state;

      const userPromptIndex = state.messages.slice(0, messageIndex).filter((message) => message.role === "user").length;
      const nextMessages = state.messages.slice(0, messageIndex + 1).map((message, index) =>
        index === messageIndex ? { ...message, content: editedContent } : message
      );

      nextMessages.push({
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        reasoning: "",
        verboseSteps: [],
        thinkingDone: false,
      });

      const nextUserPrompts = state.userPrompts.slice(0, userPromptIndex);
      nextUserPrompts.push(editedContent);

      return {
        messages: nextMessages,
        userPrompts: nextUserPrompts,
      };
    }),

  // Called on successful stream result
  finalizeAssistantMessage: (threadId, content, editId, retryId, finalCheckpointId) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      const secondLastIdx = messages.length - 2;

      // Update assistant message
      if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
        const version: ResponseVersion = {
          content,
          final_checkpoint_id: finalCheckpointId,
          final_blog_post: messages[lastIdx].final_blog_post,
          timestamp: Date.now(),
        };
        messages[lastIdx] = {
          ...messages[lastIdx],
          content,
          retry_id: retryId,
          final_checkpoint_id: finalCheckpointId,
          versions: [version],        // v0, original
          active_version_index: 0,
        };
      }

      // Update user message with edit_id
      if (secondLastIdx >= 0 && messages[secondLastIdx].role === "user") {
        messages[secondLastIdx] = {
          ...messages[secondLastIdx],
          edit_id: editId,
        };
      }

      const now = new Date().toISOString();
      return {
        messages,
        conversations: state.conversations.map((c) =>
          c.thread_id === threadId ? { ...c, updated_at: now } : c
        ),
      };
    }),

  // Called on error — attach whatever IDs we got, mark content as error
  markAssistantError: (threadId, editId, retryId) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      const secondLastIdx = messages.length - 2;

      if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
        messages[lastIdx] = {
          ...messages[lastIdx],
          // retry_id null on internal error = no retry button shown
          retry_id: retryId ?? null,
          final_checkpoint_id: null,
          thinkingDone: true,
        };
      }

      if (secondLastIdx >= 0 && messages[secondLastIdx].role === "user") {
        messages[secondLastIdx] = {
          ...messages[secondLastIdx],
          edit_id: editId ?? null,
        };
      }

      return { messages };
    }),

  softDeleteConversation: async (threadId) => {
    set((state) => {
      const filtered = state.conversations.filter((c) => c.thread_id !== threadId);
      return {
        conversations: filtered,
        currentThreadId: state.currentThreadId === threadId ? (filtered[0]?.thread_id ?? null) : state.currentThreadId,
      };
    });
    return await api.delete(`/conversations/soft-delete/${threadId}`);
  },

  hardDeleteConversation: async (threadId) => {
    set((state) => {
      const filtered = state.conversations.filter((c) => c.thread_id !== threadId);
      return {
        conversations: filtered,
        currentThreadId: state.currentThreadId === threadId ? (filtered[0]?.thread_id ?? null) : state.currentThreadId,
      };
    });
    const response = await api.delete(`/conversations/hard-delete/${threadId}`);
    return response.data;
  },

  // Add to store implementation

  // Called at start of retry — clears content so streaming starts fresh
  resetAssistantForRetry: (threadId, messageId) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const msgIdx = messages.findIndex((m) => m.id === messageId);
      if (msgIdx === -1) return state;

      messages[msgIdx] = {
        ...messages[msgIdx],
        content: "",                // clear for fresh streaming
        final_blog_post: undefined, // clear blog too
        reasoning: undefined,       // clear reasoning
        verboseSteps: [],           // reset verbose steps
        thinkingDone: false,        // reset thinking panel
      };
      return { messages };
    }),

  // Called on retry result — appends new version, updates mirrors
  appendRetryVersion: (threadId, messageId, content, finalCheckpointId, finalBlogPost) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const msgIdx = messages.findIndex((m) => m.id === messageId);
      if (msgIdx === -1) return state;

      const msg = messages[msgIdx];
      const newVersion: ResponseVersion = {
        content,
        final_checkpoint_id: finalCheckpointId,
        final_blog_post: finalBlogPost,
        timestamp: Date.now(),
      };

      const updatedVersions = [...(msg.versions ?? []), newVersion];
      const newIndex = updatedVersions.length - 1;

      messages[msgIdx] = {
        ...msg,
        content,                                      // mirror latest
        final_blog_post: finalBlogPost ?? undefined,  // mirror latest
        final_checkpoint_id: finalCheckpointId,       // mirror latest
        versions: updatedVersions,
        active_version_index: newIndex,               // jump to newest
      };

      const now = new Date().toISOString();
      return {
        messages,
        conversations: state.conversations.map((c) =>
          c.thread_id === threadId ? { ...c, updated_at: now } : c
        ),
      };
    }),
}));