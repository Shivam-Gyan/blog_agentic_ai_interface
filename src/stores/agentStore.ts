import { create } from "zustand";

export type AgentMode = "chat" | "generate" | "refine";

interface AgentStore {
  mode: AgentMode;
  setMode: (mode: AgentMode) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  mode: "chat",
  setMode: (mode) => set({ mode }),
}));
