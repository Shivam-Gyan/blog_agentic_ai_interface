import { create } from "zustand";
import type { User } from "@/interfaces/user.interface";

interface UserStore {
  user: User | null;
  jwtToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User, token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  jwtToken: null,
  isAuthenticated: false,
  loading: false,

  setUser: (user, token) =>
    set({ user, jwtToken: token, isAuthenticated: true }),

  setLoading: (loading) => set({ loading }),

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt_token");
    }
    set({ user: null, jwtToken: null, isAuthenticated: false, loading: false });
  },
}));
