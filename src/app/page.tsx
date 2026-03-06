// 'use client';

// import ChatInterface from "@/components/chat.interface";
// import ChatSidebar from "@/components/chat.sidebar";
// import { set } from "date-fns";
// import Image from "next/image";
// import { useState } from "react";


// export type handleSubmitParameter = {
//   input: string;
//   activeTool: 'chat' | 'generate' | 'refine' | null;
// };

// export default function Home() {
//   const isLoading = false;
//   const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
//   const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

//   const handleSubmit = async ({ input, activeTool }: handleSubmitParameter) => {
//     console.log("Mode", activeTool);
//     console.log("Message", input);

//     setMessages((prev) => [...prev, { role: "user", content: input }]);

//     const response = await fetch('http://127.0.0.1:8000/generate', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body:
//         JSON.stringify({
//         "user_query": input,
//         "mode": activeTool || "chat",
//         "thread_id": "user_idshivam_1223"

//       })
//     })

//     const data  = await response.json();
//     console.log("Response from backend:", data);
//     setMessages((prev) => [...prev, { role: "assistant", content: data.response}])

//   };



//   return (
//     <div className="flex scroll-smooth h-screen w-full overflow-hidden">

//       {/* ── Sidebar ── */}
//       <div
//         className={`
//           shrink-0
//           transition-all duration-300 ease-in-out z-40
//           ${sidebarOpen ? "md:w-72" : "w-0"}
//         `}
//       >
//         <ChatSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//       </div>

//       {/* ── Main Chat Area ── */}
//       <div className="flex flex-col flex-1 min-w-0 relative">

//         {/* Centered Logo */}
//         <div className="flex flex-col items-center justify-center flex-1">
//           {!messages ? <Image
//             src="/Loomora_full_removebg.png"
//             alt="Loomora-logo"
//             width={400}
//             height={200}
//             className="select-none"
//           /> : (
//             <div>
//               {messages?.map((message : { role: string; content: string }, index) => (
//                 <div key={index} className={`my-2 p-4 rounded-lg max-w-xs ${message.role === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-800 self-start'}`}>
//                   {message.role} : {message.content}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Chat Input — centered within the chat area, not the full page */}
//         <div className="w-full px-4 pb-5 flex justify-center">
//           <div className="w-full max-w-3xl">
//             <div className="rounded-2xl bg-[#efeff0] py-4 px-4 shadow-[0_-1px_6px_rgba(0,0,0,0.08)]">
//               <ChatInterface onSubmit={handleSubmit} isLoading={isLoading} />
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }
'use client'

import ChatInterface from "@/components/chat.interface";
import ChatSidebar from "@/components/chat.sidebar";
import Image from "next/image";
import { use, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type handleSubmitParameter = {
  input: string;
  activeTool: 'chat' | 'generate' | 'refine' | null;
};

export default function Home() {

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const messageEndRef = useRef<HTMLDivElement | null>(null)

  // auto scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])


  const handleSubmit = async ({ input, activeTool }: handleSubmitParameter) => {

    setIsLoading(true)

    // add user message
    setMessages(prev => [...prev, { role: "user", content: input }])

    // add empty assistant message (for streaming)
    setMessages(prev => [...prev, { role: "assistant", content: "" }])

    const response = await fetch("http://127.0.0.1:8000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_query: input,
        mode: activeTool || "chat",
        thread_id: "user_idshivam_1223"
      })
    })

    if (!response.body) {
      console.error("No response body")
      setIsLoading(false)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let assistantText = ""
    let buffer = ""
    setIsLoading(false)

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split("\n")
      // keep the last (possibly incomplete) line in the buffer
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue

        const data = JSON.parse(line.slice(6))

        if (data.type === "token") {
          assistantText += data.content

          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: "assistant",
              content: assistantText
            }
            return updated
          })
        } else if (data.type === "result") {
          // final result — overwrite with the complete response if provided
          if (data.content) {
            assistantText = data.content
          }
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: "assistant",
              content: assistantText
            }
            return updated
          })
        }
      }
    }

    setIsLoading(false)
  }

  useEffect(() => {

    
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* Sidebar */}
      <div
        className={`
        shrink-0 transition-all duration-300 z-20 
        ${sidebarOpen ? "md:w-72" : "w-16 h-screen"}
      `}
      >
        <ChatSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>


      {/* Chat Area */}
      <div className="flex flex-col flex-1 bg-white">

        {/* Messages */}
        <div className="flex-1 mt-16 md:mt-6 min-h-0 overflow-y-auto px-6 py-6 flex flex-col">

          {messages.length === 0 ? (

            <div className="flex flex-col items-center justify-center h-full opacity-80">

              <Image
                src="/Loomora_full_removebg.png"
                alt="logo"
                width={340}
                height={200}
                className="mb-6 select-none"
              />

            </div>

          ) : (

            <div className="w-full md:w-[80%] lg:w-3xl mx-auto flex flex-col gap-4">

              {messages.map((msg, i) => (

                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >

                  <div
                    className={`
                    px-4 py-3 rounded-xl text-sm leading-relaxed max-w-[75%] 
                    ${msg.role === "user"
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"}
                  `}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                </div>

              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-xl bg-gray-100 text-sm">
                    Thinking...
                  </div>
                </div>
              )}

              <div ref={messageEndRef} />

            </div>

          )}

        </div>


        {/* Chat Input */}
        <div className=" bg-white px-4 py-4">

          <div className="max-w-3xl mx-auto">

            <div className="rounded-2xl bg-[#efeff0] px-4 py-3 shadow-sm">
              <ChatInterface
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}