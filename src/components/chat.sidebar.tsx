'use client'

import { ChatSidebarTemplate, ShortSidebarStyleProps } from "@/interfaces/chat.interface";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { isToday, isYesterday, isAfter, subDays } from "date-fns";
import SidebarSection from "./sidebar.section";
import SidebarContent from "./sidebar.content";
import Image from "next/image";
import { Button } from "./ui/button";
import { MessageCirclePlus, PanelLeft, PanelRight } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";



function ShortSidebarStyle({ setSidebarOpen, sidebarOpen, isChatLoading }: ShortSidebarStyleProps) {
    return (
        <div className="flex gap-4 pt-4 items-center">

            {/* Animated Logo Container */}
            <div
                className="
                    group
                    flex
                    items-center
                    overflow-hidden
                    transition-all
                    duration-600
                    ease-in-out
                    w-[60px]
                    hover:w-[190px]
                "
            >
                {/* Icon */}
                <Image
                    src="/Loomora_icon_removebg.png"
                    alt="Loomora Icon"
                    width={60}
                    height={60}
                    loading="eager"
                    className="flex-shrink-0"
                />

                {/* Text */}
                <Image
                    src="/Loomora_text.png"
                    alt="Loomora Text"
                    width={120}
                    height={20}
                    className="
                        opacity-0
                        transition-opacity
                        duration-800
                        ease-in-out
                        group-hover:opacity-100
                    "
                />
            </div>

            {/* Buttons */}
            <div className="flex w-[5.5rem ] h-10 items-center justify-between border-2 rounded-full border-gray-300 transition-all duration-300">
                <Button
                    variant="ghost"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hover:bg-transparent hover:scale-105 focus:bg-transparent active:bg-transparent"
                >
                    <PanelLeft className="!w-5 !h-5 text-gray-500" />
                </Button>

                <Button
                    variant="ghost"
                    disabled={isChatLoading}
                    className="hover:bg-transparent hover:scale-105 focus:bg-transparent active:bg-transparent"
                >
                    <MessageCirclePlus className="!w-5 !h-5 text-gray-500" />
                </Button>
            </div>

        </div>
    );
}


export default function ChatSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
    const isChatLoading = false;
    // const chats = [{}]
    const chats: ChatSidebarTemplate[] = [
        {
            _id: "1",
            title: "Today's Chat 1",
            createdAt: new Date().toISOString(),
        },
        {
            _id: "2",
            title: "let understand the problem of agentic AI and how it can be solved",
            createdAt: new Date().toISOString(),
        },
        {
            _id: "3",
            title: "Today's Chat 3",
            createdAt: new Date().toISOString(),
        },
        {
            _id: "4",
            title: "Yesterday's Chat",
            createdAt: subDays(new Date(), 1).toISOString(),
        },
        {
            _id: "5",
            title: "Older Chat",
            createdAt: subDays(new Date(), 2).toISOString(),
        },
    ];

    let todayChats: ChatSidebarTemplate[] = [];
    let yesterdayChats: ChatSidebarTemplate[] = [];
    let last30DaysChats: ChatSidebarTemplate[] = [];
    let olderChats: ChatSidebarTemplate[] = [];

    let today = new Date();
    let thirtyDayAgo = subDays(today, 30);

    chats.forEach((chat: any) => {
        const data = new Date(chat.createdAt);
        if (isToday(data)) {
            todayChats.push(chat);
        } else if (isYesterday(data)) {
            yesterdayChats.push(chat);
        } else if (isAfter(data, thirtyDayAgo)) {
            last30DaysChats.push(chat);
        } else {
            olderChats.push(chat);
        }
    })

    return (
        <>
            <div className="md:hidden fixed w-72">
                <Sheet>
                    <SheetTrigger asChild>
                        <div className="flex gap-2 pt-4">
                            <Image
                                src="/Loomora_icon_removebg.png"
                                alt="Sidebar Logo"
                                width={80}
                                height={80}
                                loading="eager"
                            />
                            <Button
                                variant={'ghost'}
                                size={'icon'}
                                className=" mt-1 hover:rounded-full"
                            >
                                <PanelLeft className="!w-6 !h-6 text-gray-500" />
                            </Button>

                        </div>
                    </SheetTrigger>
                    <SheetContent side="left" showCloseButton={false} className="md:hidden h-screen  w-72">
                        <SheetTitle asChild>
                            <VisuallyHidden>
                                Chat Navigation Menu
                            </VisuallyHidden>
                        </SheetTitle>
                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                className="absolute right-4 top-4 hover:bg-transparent"
                            >
                                <PanelRight className="!w-6 !h-6 text-gray-500"  />
                            </Button>
                        </SheetClose>
                        <SidebarContent
                            pathname={pathname}
                            setSidebarOpen={setSidebarOpen}
                            sidebarOpen={sidebarOpen}
                            isChatLoading={isChatLoading}
                            todayChats={todayChats}
                            yesterdayChats={yesterdayChats}
                            last30DaysChats={last30DaysChats}
                            olderChats={olderChats}
                        />
                    </SheetContent>
                </Sheet>
            </div>

            <div className="hidden md:block" >
                {
                    sidebarOpen ?
                        <SidebarContent
                            pathname={pathname}
                            setSidebarOpen={setSidebarOpen}
                            sidebarOpen={sidebarOpen}
                            isChatLoading={isChatLoading}
                            todayChats={todayChats}
                            yesterdayChats={yesterdayChats}
                            last30DaysChats={last30DaysChats}
                            olderChats={olderChats}
                        />
                        :
                        <ShortSidebarStyle
                            setSidebarOpen={setSidebarOpen}
                            sidebarOpen={sidebarOpen}
                            isChatLoading={isChatLoading}
                        />
                }
            </div>
        </>
    );
}