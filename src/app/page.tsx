'use client';

import ChatInterface from "@/components/chat.interface";
import ChatSidebar from "@/components/chat.sidebar";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const isLoading = false;
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const handleSubmit = (message: string) => {
    console.log("Message submitted:", message);
  };

  return (
    <div className="flex scroll-smooth h-screen w-full overflow-hidden">

      {/* ── Sidebar ── */}
      <div
        className={`
          shrink-0
          transition-all duration-300 ease-in-out z-40
          ${sidebarOpen ? "md:w-72" : "w-0"}
        `}
      >
        <ChatSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex flex-col flex-1 min-w-0 relative">

        {/* Centered Logo */}
        <div className="flex flex-col items-center justify-center flex-1">
          <Image
            src="/Loomora_full_removebg.png"
            alt="Loomora-logo"
            width={400}
            height={200}
            className="select-none"
          />
        </div>

        {/* Chat Input — centered within the chat area, not the full page */}
        <div className="w-full px-4 pb-5 flex justify-center">
          <div className="w-full max-w-3xl">
            <div className="rounded-2xl bg-[#efeff0] py-4 px-4 shadow-[0_-1px_6px_rgba(0,0,0,0.08)]">
              <ChatInterface onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}