import { create } from "zustand";
import type { Conversation, Message } from "@/interfaces/conversation.interface";

interface ConversationStore {
  conversations: Conversation[];
  currentThreadId: string | null;
  createConversation: (title?: string) => string;
  setCurrentThread: (threadId: string) => void;
  addMessage: (threadId: string, message: Message) => void;
  appendAssistantMessage: (threadId: string, chunk: string) => void;
  setLastAssistantContent: (threadId: string, content: string) => void;
  deleteConversation: (threadId: string) => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  conversations: [],
  currentThreadId: null,

  createConversation: (title = "New Conversation") => {
    const thread_id = crypto.randomUUID();
    set((state) => ({
      conversations: [
        { thread_id, title, createdAt: new Date().toISOString(), messages: [] },
        ...state.conversations,
      ],
      currentThreadId: thread_id,
    }));
    return thread_id;
  },

  setCurrentThread: (threadId) => set({ currentThreadId: threadId }),

  addMessage: (threadId, message) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.thread_id === threadId
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      ),
    })),

  // Appends a streamed text chunk to the last assistant message in the thread.
  appendAssistantMessage: (threadId, chunk) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.thread_id !== threadId) return conv;

        const messages = [...conv.messages];
        const lastIdx = messages.length - 1;

        if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
          messages[lastIdx] = {
            ...messages[lastIdx],
            content: messages[lastIdx].content + chunk,
          };
        }

        return { ...conv, messages };
      }),
    })),

  // Replaces the last assistant message content (used for final 'result' events)
  setLastAssistantContent: (threadId, content) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.thread_id !== threadId) return conv;
        const messages = [...conv.messages];
        const lastIdx = messages.length - 1;
        if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
          messages[lastIdx] = { ...messages[lastIdx], content };
        }
        return { ...conv, messages };
      }),
    })),

  deleteConversation: (threadId) =>
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
    }),
}));
