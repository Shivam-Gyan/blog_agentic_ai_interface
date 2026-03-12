"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import { useThemeStore } from "@/stores/themeStore";
import api from "@/services/api";
import { useConversationStore } from "@/stores/conversationStore";

/**
 * Runs once on application mount to:
 *  1. Apply the persisted theme class to <html>.
 *  2. Read the JWT from localStorage, call GET /api/user/profile,
 *     and populate the userStore if the token is valid.
 */
export function useInitializeApp() {
  const setUser = useUserStore((s) => s.setUser);
  const setLoading = useUserStore((s) => s.setLoading);
  const logout = useUserStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);

  const setInitialized = useUserStore((s) => s.setInitialized);
  const setConversation = useConversationStore((s) => s.setConversation);

  // Sync persisted theme → DOM class on first render
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Validate stored JWT and hydrate user profile
  useEffect(() => {
    const initAuth = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("jwt_token")
          : null;

      if (!token) {
        setInitialized(true);
        return;
      }

      setLoading(true);
      try {
        const { data } = await api.get("/user/detail");
        console.log("Authenticated user:", data.response);
        setUser(data.response, token);

        const conversationRes = await api.get("/conversations");

        const conversations = conversationRes?.data?.conversations ?? []
        console.log("Fetched conversations:", conversationRes);
        setConversation(conversations);
        
      } catch (err) {
        // Token invalid or expired — clear everything
        console.error("Auth init failed:", err);
        logout();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
