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



import { create } from "zustand";
import type { Message, VerboseStep } from "@/interfaces/conversation.interface";
import api from "@/services/api";

// Matches the backend GET /conversations response shape exactly
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
  setLastAssistantContent: (threadId: string, content: string) => void;
  hardDeleteConversation: (threadId: string) => Promise<any>;
  softDeleteConversation: (threadId: string) => Promise<any>;
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
        {
          thread_id,
          title,
          created_at: now,
          updated_at: now,
          is_active: true,
          message_count: 0,
        },
        ...state.conversations,
      ],
      currentThreadId: thread_id,
      messages: [],
      userPrompts: [],
    }));
    return thread_id;
  },

  getMessagesByThreadId: async (threadId) => {
    try {
      const conversation = await api.get(`/conversations/${threadId}`);
      const rawMessages = conversation?.data?.conversation?.messages ?? [];

      const messages: Message[] = rawMessages.map(
        (m: { role: string; content: string; final_blog?:string; timestamp: string }, i: number) => ({
          id: `${threadId}-${i}`,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp).getTime(),
          final_blog_post: m.final_blog || undefined,
          // reasoning is not persisted to DB — only live during a stream
          reasoning: undefined,
        })
      );

      const prompts = conversation?.data?.conversation?.user_prompts ?? [];
      set({ messages, userPrompts: prompts });
      return messages;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        const now = new Date().toISOString();
        set((state) => ({
          conversations: [
            {
              thread_id: threadId,
              title: "New Chat",
              created_at: now,
              updated_at: now,
              is_active: true,
              message_count: 0,
            },
            ...state.conversations,
          ],
          currentThreadId: threadId,
          messages: [],
        }));
        return [];
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

  // Appends a streamed answer token to the last assistant message
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

  appendVerboseStep: (threadId: string, step: { content: string; detail?: string | null }) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      if (lastIdx < 0 || messages[lastIdx].role !== "assistant") return state;

      const prev = messages[lastIdx].verboseSteps ?? [];

      // Mark all previous steps as done, add new one as active
      const updated: VerboseStep[] = [
        ...prev.map(s => ({ ...s, state: "done" as const })),
        {
          id: crypto.randomUUID(),
          content: step.content,
          detail: step.detail ?? null,
          state: "active" as const,
        },
      ];

      messages[lastIdx] = { ...messages[lastIdx], verboseSteps: updated };
      return { messages };
    }),

  setThinkingDone: (threadId: string) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      if (lastIdx < 0 || messages[lastIdx].role !== "assistant") return state;

      const prev = messages[lastIdx].verboseSteps ?? [];
      messages[lastIdx] = {
        ...messages[lastIdx],
        thinkingDone: true,
        verboseSteps: prev.map(s => ({ ...s, state: "done" as const })),
      };
      return { messages };
    }),

  setFinalBlogPost:(threadId: string, content: string) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      if (lastIdx < 0 || messages[lastIdx].role !== "assistant") return state;
      messages[lastIdx] = {
        ...messages[lastIdx],
        final_blog_post: content,
      };
      return { messages };
    }),
  // Appends a streamed reasoning token to the last assistant message's
  // separate `reasoning` field — never mixed into `content`
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

  // Replaces the last assistant message's content with the final result
  setLastAssistantContent: (threadId, content) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
        messages[lastIdx] = { ...messages[lastIdx], content };
      }
      const now = new Date().toISOString();
      return {
        messages,
        conversations: state.conversations.map((c) =>
          c.thread_id === threadId
            ? { ...c, message_count: c.message_count + 1, updated_at: now }
            : c
        ),
      };
    }),

  softDeleteConversation: async (threadId) => {
    set((state) => {
      const filtered = state.conversations.filter((c) => c.thread_id !== threadId);
      return {
        conversations: filtered,
        currentThreadId:
          state.currentThreadId === threadId
            ? (filtered[0]?.thread_id ?? null)
            : state.currentThreadId,
      };
    });
    const response = await api.delete(`/conversations/soft-delete/${threadId}`);
    return response;
  },

  hardDeleteConversation: async (threadId) => {
    set((state) => {
      const filtered = state.conversations.filter((c) => c.thread_id !== threadId);
      return {
        conversations: filtered,
        currentThreadId:
          state.currentThreadId === threadId
            ? (filtered[0]?.thread_id ?? null)
            : state.currentThreadId,
      };
    });
    const response = await api.delete(`/conversations/hard-delete/${threadId}`);
    return response.data;
  },
}));