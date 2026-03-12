"use client";

import { ChatSidebarSectionProps } from "@/interfaces/chat.interface";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { EllipsisVertical, Trash2,ArchiveRestore } from "lucide-react";
import { useConversationStore } from "@/stores/conversationStore";
import {DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent} from '@/components/ui/dropdown-menu';



export default function SidebarSection({ title, chats }: ChatSidebarSectionProps) {

    const router = useRouter();
    const currentThreadId = useConversationStore((s) => s.currentThreadId);
    const setCurrentThread = useConversationStore((s) => s.setCurrentThread);
    const softDeleteConversation = useConversationStore((s) => s.softDeleteConversation);
    const hardDeleteConversation = useConversationStore((s) => s.hardDeleteConversation);
    const createConversation = useConversationStore((s) => s.createConversation);
    // const getMessagesByThreadId = useConversationStore((s) => s.getMessagesByThreadId);

    // if there is no chat in this section, then return null
    if (chats.length === 0) return null;
    // console.log("Rendering SidebarSection with title:", title, "and chats:", chats);

    const handleChangeThreadId = async (threadId: string) => {
        router.push(`/chat/${threadId}`);
    };

    const handleHardDeleteClick = (e: React.MouseEvent<HTMLButtonElement>, threadId: string) => {
        e.stopPropagation(); // Prevent the click from bubbling up to the chat item
       
        hardDeleteConversation(threadId);
        // If the deleted conversation is currently open, navigate to a safe route (e.g., homepage or new chat)
        if (currentThreadId === threadId) {
            const newThread_id = createConversation("new chat");
            setCurrentThread(newThread_id);
            router.push(`/chat/${newThread_id}`);
        }
        
    }


    return (

        <section className="mb-4 select-none">

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
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleChangeThreadId(chat.thread_id); }}
                        className={cn(
                            "flex justify-around items-center px-2 py-1 rounded-lg group hover:bg-blue-100 cursor-pointer",
                            currentThreadId === chat.thread_id && 'bg-[#dbeaff]'
                        )}
                    >
                        <span className="truncate text-gray-800 text-md flex-1">
                            {chat.title}
                        </span>
                        {/* <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='opacity-0 hover:bg-blue-200 hover:rounded-full group-hover:opacity-100 h-8 w-8'
                            onClick={(e) => { e.stopPropagation(); softDeleteConversation(chat.thread_id); }}
                        >
                            <Trash2 className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                        </Button> */}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild className="p-4 py-2">
                                <Button
                                    type='button'
                                    variant='none'
                                    size='icon'
                                    className=' hover:bg-blue-200 hover:border-0 rounded-full  h-8 w-8'
                                    
                                >
                                    <EllipsisVertical className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                                </Button>

                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-52 rounded-xl shadow-lg border border-gray-200"
                                align="start"
                                side="bottom"
                            >
                                <button
                                    // size='icon'
                                    onClick={(e) => { e.stopPropagation(); softDeleteConversation(chat.thread_id); }}
                                    className="flex text-gray-600 font-Geist w-full px-3 py-2 items-center gap-2  rounded-md cursor-pointer  hover:bg-blue-100 focus:bg-blue-100"
                                    // onClick={logout}
                                >
                                    <ArchiveRestore className="size-5 text-gray-500 font-Geist" />
                                    <span className="text-sm font-Geist">Archieve</span>
                                </button>
                                <button
                                    onClick={(e) => handleHardDeleteClick(e, chat.thread_id)}
                                    className="flex text-gray-600 font-Geist w-full px-3 py-2 items-center gap-2  rounded-md cursor-pointer  hover:bg-blue-100 focus:bg-blue-100"
                                    // onClick={logout}
                                >
                                    <Trash2 className="size-5 text-gray-500 " />
                                    <span className="text-sm ">Delete</span>
                                </button>

                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </div>
        </section>
    );

}