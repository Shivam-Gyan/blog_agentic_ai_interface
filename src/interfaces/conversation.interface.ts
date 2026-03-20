export type MessageRole = "user" | "assistant";


export interface ResponseVersion {
  content: string;
  final_checkpoint_id: string | null; // The ID used to generate this version
  final_blog_post?: string;
  reasoning?: string;
  timestamp: number;
}


export interface VerboseStep {
  id: string,
  content: string;         // "Detecting intent..." / "Calling tool: tavily_search..."
  detail:  string | null;  // tool query detail, null for non-tool steps
  state?:   "active" | "done";
}

export interface Message {
  id:string;

  edit_id?: string | null;   // Stored on USER message ( to edit the user message and response completely)
  retry_id?: string | null;  // Stored on ASSISTANT message ( to retry the assistant response with the same user message)
  final_checkpoint_id?: string | null; // Current active final state on ASSISTANT message final checkpoint_id
  
  role: MessageRole;
  content: string;
  timestamp: number;

  versions?: ResponseVersion[]; // Array of retries
  active_version_index?: number; // e.g., 4 (for the 5th version)

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
