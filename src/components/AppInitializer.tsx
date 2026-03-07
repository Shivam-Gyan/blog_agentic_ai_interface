"use client";

import { useInitializeApp } from "@/hooks/useInitializeApp";

/**
 * Client-side boundary that runs app initialization logic (auth hydration,
 * theme application) without blocking the server render of its children.
 */
export default function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  useInitializeApp();
  return <>{children}</>;
}
