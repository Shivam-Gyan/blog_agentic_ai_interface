export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface Conversation {
  thread_id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

export interface ConversationState {
  conversations: Conversation[];
  currentThreadId: string | null;
}
