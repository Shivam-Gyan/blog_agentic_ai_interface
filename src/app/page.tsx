'use client';

import ChatInterface from "@/components/chat.interface";
import ChatSidebar from "@/components/chat.sidebar";
import Image from "next/image";


export default function Home() {

  const isLoading = false;

  const handleSubmit = (message: string) => {
    console.log("Message submitted:", message);
    // Here you can add logic to send the message to your backend or process it as needed
  }
  return (
    <div className="flex h-screen w-full">
      <ChatSidebar />

      <div className="flex flex-col flex-1 relative">

        {/* Logo Center */}
        <div className="flex flex-col items-center justify-center flex-1">
          <Image
            src="/Loomora_full_removebg.png"
            alt="Loomora-logo"
            width={400}
            height={200}
          />
        </div>

        {/* Chat Input */}
        <div className="fixed bottom-5 z-10 md:left-7 md:mr-10 lg:mr-0 lg:left-0 w-full px-4 flex justify-center">
            <ChatInterface onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

      </div>
    </div>
  );
}
