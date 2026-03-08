'use client';

import { ChatSidebarSectionProps } from "@/interfaces/chat.interface";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { useConversationStore } from "@/stores/conversationStore";
import api from "@/services/api";



export default function SidebarSection({ title, chats }: ChatSidebarSectionProps) {

    const currentThreadId = useConversationStore((s) => s.currentThreadId);
    const setCurrentThread = useConversationStore((s) => s.setCurrentThread);
    const deleteConversation = useConversationStore((s) => s.deleteConversation);
    const getMessagesByThreadId = useConversationStore((s) => s.getMessagesByThreadId);

    // if there is no chat in this section, then return null
    if (chats.length === 0) return null;
    // console.log("Rendering SidebarSection with title:", title, "and chats:", chats);

    const handleChangeThreadId = async(threadId: string) => {

        await getMessagesByThreadId(threadId);
        // console.log("Fetched conversation details for threadId", threadId, response);
        setCurrentThread(threadId);
        // setMessages(response);
    } 


    return (

        <section className="mb-4">

            <h3 className="mb-2 px-2 text-sm capitalize font-bold text-gray-400">{title}</h3>

            <div className="space-y-1 w-60">
                {chats.map((chat) => (
                    // <Link key={chat.thread_id} href={`/chat/${chat.thread_id}`} 
                    // className={cn(
                    //     "flex justify-around items-center px-2 py-1 rounded-lg group hover:bg-blue-100", pathname === `/chat/${chat.thread_id}`&& 'bg-[#dbeaff]'
                    // )}
                    <div key={chat.thread_id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleChangeThreadId(chat.thread_id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setCurrentThread(chat.thread_id); }}
                        className={cn(
                            "flex justify-around items-center px-2 py-1 rounded-lg group hover:bg-blue-100 cursor-pointer",
                            currentThreadId === chat.thread_id && 'bg-[#dbeaff]'
                        )}
                    >
                        <span className="truncate text-gray-800 text-md flex-1">
                            {chat.title}
                        </span>
                        <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='opacity-0 hover:bg-blue-200 hover:rounded-full group-hover:opacity-100 h-8 w-8'
                            onClick={(e) => { e.stopPropagation(); deleteConversation(chat.thread_id); }}
                        >
                            <Trash2 className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                        </Button>
                    </div>
                ))}
            </div>
        </section>
    );

}