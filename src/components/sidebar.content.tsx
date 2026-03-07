'use client';

import Image from "next/image";
import { Button } from "./ui/button";
import { KeyRound, LogOut, MessageCirclePlus, PanelRight } from "lucide-react";
import SidebarSection from "./sidebar.section";
import { ScrollArea } from "./ui/scroll-area";
import { SidebarContentProps } from "@/interfaces/chat.interface";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { profile } from "console";
import Link from "next/link";
import { useUserStore } from "@/stores/userStore";
import { useConversationStore } from "@/stores/conversationStore";


export default function SidebarContent({ pathname, setSidebarOpen, sidebarOpen, isChatLoading, todayChats, yesterdayChats, last30DaysChats, olderChats }: SidebarContentProps) {
    // console.log(sidebarOpen);
    // const user = {
    //     name: "John Doe",
    //     profilePicture: "/avatar.png",
    //     email: 'john.doe@example.com'
    // }
    const user           = useUserStore((s) => s.user);
    const logout         = useUserStore((s) => s.logout);
    const createConversation = useConversationStore((s) => s.createConversation);
    return (
        // <div className="relative px-4 bg-blue-100/30 h-screen w-72">
        <div className=" relative px-4 bg-blue-100/30 h-screen w-72 flex flex-col">

            {/*  logo and side panel toogleing button */}
            {/* <div className="flex justify-between w-64 items-center"> */}
            <div className="flex justify-between w-full items-center">
                <Image
                    src="/Loomora_text.png"
                    alt="Sidebar Logo"
                    width={130}
                    height={120}
                    loading="eager"
                    className="select-none"
                />

                <Button onClick={() => setSidebarOpen(!sidebarOpen)}
                    variant='ghost' className="md:flex h-12 icon-lg hidden hover:bg-blue-100 hover:rounded-full cursor-pointer" >
                    <PanelRight className="size-6 text-gray-500" />
                </Button>
            </div>

            {/* create new Chat  */}
            <div className="my-4">
                <Button
                    variant='ghost'
                    disabled={isChatLoading}
                    onClick={() => createConversation()}
                    className="bg-blue-100 h-12 cursor-pointer rounded-full text-slate-700 hover:shadow-md hover:bg-blue-100 w-full">
                    <MessageCirclePlus className="size-5 font-medium mr-2" /> New Chat
                </Button>
            </div>

            {/* chat history display */}

            {/* <ScrollArea className="flex-1 px-2"> */}
            <ScrollArea className="flex-1 h-0 min-h-0 px-2">
                {isChatLoading ? (
                    <div className="flex justify-center py-4">
                        <p className="text-sm text-muted-foreground">Loading chats...</p>
                    </div>
                ) : (
                    <>
                        <SidebarSection
                            title="today"
                            chats={todayChats}
                            pathname={pathname}
                        />
                        <SidebarSection
                            title="Yesterday"
                            chats={yesterdayChats}
                            pathname={pathname}
                        />
                        <SidebarSection
                            title="30 Days"
                            chats={last30DaysChats}
                            pathname={pathname}
                        />
                        {olderChats.length > 0 && (
                            <SidebarSection
                                title="Older"
                                chats={olderChats}
                                pathname={pathname}
                            />
                        )}
                    </>
                )}
            </ScrollArea>

            <div className="sticky bottom-0 left-0 w-full">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="p-4 py-2">
                        <div className="flex gap-4 items-center cursor-pointer mb-5 hover:bg-blue-100 rounded-md">
                            <Avatar className="w-10 h-10 border-2 border-gray-400">
                                <AvatarImage src={user?.avatar ?? "/avatar.png"} alt={user?.name ?? "User"} />
                                <AvatarFallback className="text-xl font-medium text-slate-500">
                                    {user?.name?.charAt(0).toUpperCase() ?? "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col ">
                                <span className="text-sm font-medium text-gray-900 truncate max-w-40">
                                    My Profile
                                </span>

                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-64 p-2 rounded-xl shadow-lg border border-gray-200"
                        align="start"
                        side="top"
                    >

                        <div className="flex items-center gap-3 p-3 border-b border-gray-100">
                            <Avatar className="w-10 h-10 border-2 border-gray-400">
                                    <AvatarImage src={user?.avatar ?? "/avatar.png"} />
                                    <AvatarFallback className="text-xl font-medium text-slate-500">
                                        {user?.name?.charAt(0).toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                </Avatar>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name ?? "Guest"}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email ?? ""}</p>
                            </div>
                        </div>

                        <Link href='/' className="p-3 px-4 capitalize text-gray-700 hover:bg-blue-100 cursor-pointer rounded-md flex gap-2 items-center">
                            <KeyRound className="size-5" />
                            <span className="">Integration</span>
                        </Link>

                        <DropdownMenuItem
                            className="flex items-center mt-2 gap-2 p-3 px-4 rounded-md cursor-pointer text-red-600 hover:bg-red-100 focus:bg-red-100"
                            onClick={logout}
                        >
                            <LogOut className="size-5 text-red-500" />
                            <span className="text-sm">Logout</span>
                        </DropdownMenuItem>

                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

        </div>
    );
}