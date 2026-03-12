import { create } from "zustand";
import type { Message } from "@/interfaces/conversation.interface";
import api from "@/services/api";
import { threadId } from "worker_threads";

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
  // setPrompts: (prompt: string | "") => void;
  getMessagesByThreadId: (threadId: string) => Promise<Message[]>;
  setConversation: (conversations: ConversationSummary[]) => void;
  createConversation: (title?: string) => string;
  setCurrentThread: (threadId: string) => void;
  addMessage: (threadId: string, message: Message) => void;
  appendAssistantMessage: (threadId: string, chunk: string) => void;
  setLastAssistantContent: (threadId: string, content: string) => void;
  hardDeleteConversation: (threadId: string) => Promise<any>;
  softDeleteConversation: (threadId: string) => Promise<any>;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  conversations: [],
  currentThreadId: null,
  messages: [],
  userPrompts: [],
  
  setConversation: (conversations: ConversationSummary[]) => set({ conversations }),
  
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

  getMessagesByThreadId: async (threadId) => {
    const conversation = await api.get(`/conversations/${threadId}`);
    console.log("Fetched conversation for threadId", threadId, conversation);
    const rawMessages = conversation?.data?.conversation?.messages ?? [];
    // console.log("Fetched conversation for threadId", threadId, conversation);

    // Normalize backend shape → frontend Message shape
    const messages = rawMessages.map((m: { role: string; content: string; timestamp: string }, i: number) => ({
      id: `${threadId}-${i}`,
      role: m.role,
      content: m.content,
      timestamp: new Date(m.timestamp).getTime(),
    }));

    const prompts = conversation?.data?.conversation?.user_prompts ?? [];

    set({ messages, userPrompts: prompts });
    return messages;
  },

  // setPrompts:(prompt:string)=> set((state)=>({userPrompts: prompt.length === 0 ? [] : [...state.userPrompts, prompt]})),


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
      messages: threadId === state.currentThreadId ? [...state.messages, message] : state.messages,
      userPrompts: threadId === state.currentThreadId &&  message.role === 'user' ? [...state.userPrompts, message.content] : state.userPrompts,
    })),

  // Appends a streamed text chunk to the last assistant message in the thread.
  appendAssistantMessage: (threadId, chunk) =>
    set((state) => {
      if (threadId !== state.currentThreadId) return state;
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
        messages[lastIdx] = { ...messages[lastIdx], content: messages[lastIdx].content + chunk };
      }
      return { messages };
    }),

  // Replaces the last assistant message content (used for final 'result' events)
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

  softDeleteConversation: async (threadId) =>{
    set((state) => {
      const filtered = state.conversations.filter(
        (c) => c.thread_id !== threadId
      );
      return {
        conversations: filtered,
        currentThreadId:
          state.currentThreadId === threadId
            ? (filtered[0]?.thread_id ?? null)
            : state.currentThreadId,
      };
    });

    //  set conversation is_active: false in backend
    // logic here 

    const response = await api.delete(`/conversations/soft-delete/${threadId}`);

    console.log("Soft delete response for threadId", threadId, response);

    return response;
  },

  hardDeleteConversation: async(threadId) => {
    set((state) => {
      const filtered = state.conversations.filter(
        (c) => c.thread_id !== threadId
      );
      return {  
        conversations: filtered,
        currentThreadId:
          state.currentThreadId === threadId
            ? (filtered[0]?.thread_id ?? null)
            : state.currentThreadId,
      };
    });

    // hard delete from backend
    const response = await api.delete(`/conversations/hard-delete/${threadId}`);
    console.log("Hard delete response for threadId", threadId, response);

    return response.data;
  }

}));
