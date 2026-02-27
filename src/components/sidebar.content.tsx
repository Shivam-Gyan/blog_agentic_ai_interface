import Image from "next/image";
import { Button } from "./ui/button";
import { MessageCirclePlus, PanelRight } from "lucide-react";
import SidebarSection from "./sidebar.section";
import { ScrollArea } from "./ui/scroll-area";
import { SidebarContentProps } from "@/interfaces/chat.interface";


export default function SidebarContent({ pathname, setSidebarOpen, sidebarOpen, isChatLoading, todayChats, yesterdayChats, last30DaysChats, olderChats }: SidebarContentProps) {
    console.log(sidebarOpen);

    return (
        <div className="px-4 bg-blue-100/30 h-screen w-72">

            {/*  logo and side panel toogleing button */}
            <div className="flex justify-between w-64 items-center">
                <Image
                    src="/Loomora_text.png"
                    alt="Sidebar Logo"
                    width={130}
                    height={120}
                    loading="eager"
                />

                <Button onClick={() => setSidebarOpen(!sidebarOpen)}
                    variant='ghost' className="md:flex hidden hover:bg-blue-100 hover:rounded-full cursor-pointer" >
                    <PanelRight className="!w-6 !h-6 text-gray-500"  />
                </Button>
            </div>

            {/* create new Chat  */}
            <div className="my-4">
                <Button
                    variant='ghost'
                    disabled={isChatLoading}
                    className="bg-blue-100 h-12 cursor-pointer rounded-full text-slate-700 hover:shadow-md hover:bg-blue-100 w-full">
                    <MessageCirclePlus className="h-8 w-8 mr-2" /> New Chat
                </Button>
            </div>

            {/* chat history display */}

            <ScrollArea className="flex-1 px-2">
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


        </div>
    );
}