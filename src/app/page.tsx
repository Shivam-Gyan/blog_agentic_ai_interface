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
      <div className="flex flex-col mt-60 mx-auto w-full">
        <div className="flex flex-col items-center gap-2 md:ml-40">
          <div className="flex flex-col items-center gap-4 justify-center">
            <div className="">
              <Image
                src="/Loomora_full_removebg.png"
                alt="Loomora-logo"
                width={400}
                height={200}
                className=""
              />
            </div>
          </div>
        </div>
        <div className="fixed w-full md:w-[calc(100%-288px)] bottom-5  flex px-4 justify-center items-center">
          <ChatInterface onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
