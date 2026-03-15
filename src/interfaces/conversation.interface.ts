export type MessageRole = "user" | "assistant";


export interface VerboseStep {
  id: string,
  content: string;         // "Detecting intent..." / "Calling tool: tavily_search..."
  detail:  string | null;  // tool query detail, null for non-tool steps
  state?:   "active" | "done";
}

export interface Message {
  id: string ;
  role: MessageRole;
  content: string;
  timestamp: number;
  reasoning?: string;
  verboseSteps?: VerboseStep[];   // ← add this
  thinkingDone?: boolean;          // ← add this to mark when all reasoning is done
  final_blog_post?: string;           // ← add this to hold the final blog post content
}
export interface Conversation {
  thread_id: string;
  title: string;
  createdAt: string;
  messages: Message[];
  is_active?: boolean;
}

export interface ConversationState {
  conversations: Conversation[];
  currentThreadId: string | null;
}
