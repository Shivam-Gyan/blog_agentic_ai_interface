import { create } from "zustand";
import type { User } from "@/interfaces/user.interface";

interface UserStore {
  user: User | null;
  jwtToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User, token: string) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  jwtToken: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,

  setUser: (user, token) =>{
    set({ user, jwtToken: token, isAuthenticated: true });
    localStorage.setItem("jwt_token", token);
  },

  setLoading: (loading) => set({ loading }),

  setInitialized: (initialized) => set({ initialized }),

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt_token");
    }
    set({ user: null, jwtToken: null, isAuthenticated: false, loading: false });
  },
}));
