import { ChatSidebarSectionProps } from "@/interfaces/chat.interface";
import { cn } from "@/lib/utils";
import  Link  from "next/link";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";



export default function SidebarSection({ title, chats, pathname }: ChatSidebarSectionProps) {

    // if there is no chat in this section, then return null
    if (chats.length === 0) return null;

    return (

        <section className="mb-4">

            <h3 className="mb-2 px-2 text-sm capitalize font-bold text-gray-400">{title}</h3>

            <div className="space-y-1 w-60">
                {chats.map((chat) => (
                    <Link key={chat._id} href={`/chat/${chat._id}`} 
                    className={cn(
                        "flex justify-around items-center px-2 py-1 rounded-lg group hover:bg-blue-100", pathname === `/chat/${chat._id}`&& 'bg-[#dbeaff]'
                    )}
                    >
                        <span className="truncate text-gray-800 text-md flex-1">
                            {chat.title}
                        </span>
                        <Button type='button' variant='ghost' size='icon' className='opacity-0 hover:bg-blue-200 hover:rounded-full group-hover:opacity-100 h-8 w-8'>
                            <Trash2 className="h-4 w-4 text-gray-500 hover:text-gray-700"/>
                        </Button>
                    </Link>
                ))}
            </div>
        </section>
    );

}