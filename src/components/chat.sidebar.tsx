// 'use client'

// import { ChatSidebarTemplate, ShortSidebarStyleProps } from "@/interfaces/chat.interface";
// import { usePathname, useRouter } from "next/navigation";
// import { useState } from "react";
// import { isToday, isYesterday, isAfter, subDays } from "date-fns";
// import SidebarSection from "./sidebar.section";
// import SidebarContent from "./sidebar.content";
// import Image from "next/image";
// import { Button } from "./ui/button";
// import { MessageCirclePlus, PanelLeft, PanelRight } from "lucide-react";
// import { ScrollArea } from "./ui/scroll-area";
// import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
// import { VisuallyHidden } from "@radix-ui/react-visually-hidden";



// function ShortSidebarStyle({ setSidebarOpen, sidebarOpen, isChatLoading }: ShortSidebarStyleProps) {
//     return (
//         <div className=" sticky top-0 gap-4 pt-4 items-center">

//             {/* Animated Logo Container */}
//             <div
//                 className="
//                     group
//                     flex
//                     items-center
//                     overflow-hidden
//                     transition-all
//                     duration-600
//                     ease-in-out
//                     w-15
//                     hover:w-47.5
//                 "
//             >
//                 {/* Icon */}
//                 <Image
//                     src="/Loomora_icon_removebg.png"
//                     alt="Loomora Icon"
//                     width={60}
//                     height={60}
//                     loading="eager"
//                     className="shrink-0"
//                 />

//                 {/* Text */}
//                 <Image
//                     src="/Loomora_text.png"
//                     alt="Loomora Text"
//                     width={120}
//                     height={20}
//                     className="
//                         opacity-0
//                         transition-opacity
//                         duration-800
//                         ease-in-out
//                         group-hover:opacity-100
//                     "
//                 />
//             </div>

//             {/* Buttons */}
//             <div className="flex w-[5.5rem ] h-10 items-center justify-between border-2 rounded-full border-gray-300 transition-all duration-300">
//                 <Button
//                     variant="ghost"
//                     onClick={() => setSidebarOpen(!sidebarOpen)}
//                     className="hover:bg-transparent hover:scale-105 focus:bg-transparent active:bg-transparent"
//                 >
//                     <PanelLeft className="!w-5 !h-5 text-gray-500" />
//                 </Button>

//                 <Button
//                     variant="ghost"
//                     disabled={isChatLoading}
//                     className="hover:bg-transparent hover:scale-105 focus:bg-transparent active:bg-transparent"
//                 >
//                     <MessageCirclePlus className="!w-5 !h-5 text-gray-500" />
//                 </Button>
//             </div>

//         </div>
//     );
// }


// export default function ChatSidebar() {
//     const pathname = usePathname();
//     const router = useRouter();

//     const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
//     const isChatLoading = false;
//     // const chats = [{}]
//     const chats: ChatSidebarTemplate[] = [
//         {
//             _id: "1",
//             title: "Today's Chat 1",
//             createdAt: new Date().toISOString(),
//         },
//         {
//             _id: "2",
//             title: "let understand the problem of agentic AI and how it can be solved",
//             createdAt: new Date().toISOString(),
//         },
//         {
//             _id: "3",
//             title: "Today's Chat 3",
//             createdAt: new Date().toISOString(),
//         },
//         {
//             _id: "4",
//             title: "Yesterday's Chat",
//             createdAt: subDays(new Date(), 1).toISOString(),
//         },
//         {
//             _id: "5",
//             title: "Older Chat",
//             createdAt: subDays(new Date(), 2).toISOString(),
//         },
//     ];

//     let todayChats: ChatSidebarTemplate[] = [];
//     let yesterdayChats: ChatSidebarTemplate[] = [];
//     let last30DaysChats: ChatSidebarTemplate[] = [];
//     let olderChats: ChatSidebarTemplate[] = [];

//     let today = new Date();
//     let thirtyDayAgo = subDays(today, 30);

//     chats.forEach((chat: any) => {
//         const data = new Date(chat.createdAt);
//         if (isToday(data)) {
//             todayChats.push(chat);
//         } else if (isYesterday(data)) {
//             yesterdayChats.push(chat);
//         } else if (isAfter(data, thirtyDayAgo)) {
//             last30DaysChats.push(chat);
//         } else {
//             olderChats.push(chat);
//         }
//     })

//     return (
//         <>
//             <div className="md:hidden z-30 fixed w-72">
//                 <Sheet>
//                     <SheetTrigger asChild>
//                         <div className="sticky top-0 gap-2 pt-4">
//                             <Image
//                                 src="/Loomora_icon_removebg.png"
//                                 alt="Sidebar Logo"
//                                 width={80}
//                                 height={80}
//                                 loading="eager"
//                             />
//                             <Button
//                                 variant={'ghost'}
//                                 size={'icon'}
//                                 className=" mt-1 hover:rounded-full"
//                             >
//                                 <PanelLeft className="!w-6 !h-6 text-gray-500" />
//                             </Button>

//                         </div>
//                     </SheetTrigger>
//                     <SheetContent side="left" showCloseButton={false} className="md:hidden h-screen  w-72">
//                         <SheetTitle asChild>
//                             <VisuallyHidden>
//                                 Chat Navigation Menu
//                             </VisuallyHidden>
//                         </SheetTitle>
//                         <SheetClose asChild>
//                             <Button
//                                 variant="ghost"
//                                 className="absolute right-4 top-4 hover:bg-transparent"
//                             >
//                                 <PanelRight className="!w-6 !h-6 text-gray-500"  />
//                             </Button>
//                         </SheetClose>
//                         <SidebarContent
//                             pathname={pathname}
//                             setSidebarOpen={setSidebarOpen}
//                             sidebarOpen={sidebarOpen}
//                             isChatLoading={isChatLoading}
//                             todayChats={todayChats}
//                             yesterdayChats={yesterdayChats}
//                             last30DaysChats={last30DaysChats}
//                             olderChats={olderChats}
//                         />
//                     </SheetContent>
//                 </Sheet>
//             </div>

//             <div className="hidden md:block" >
//                 {
//                     sidebarOpen ?
//                         <SidebarContent
//                             pathname={pathname}
//                             setSidebarOpen={setSidebarOpen}
//                             sidebarOpen={sidebarOpen}
//                             isChatLoading={isChatLoading}
//                             todayChats={todayChats}
//                             yesterdayChats={yesterdayChats}
//                             last30DaysChats={last30DaysChats}
//                             olderChats={olderChats}
//                         />
//                         :
//                         <ShortSidebarStyle
//                             setSidebarOpen={setSidebarOpen}
//                             sidebarOpen={sidebarOpen}
//                             isChatLoading={isChatLoading}
//                         />
//                 }
//             </div>
//         </>
//     );
// }


'use client'

import { ChatSidebarTemplate, ShortSidebarStyleProps } from "@/interfaces/chat.interface";
import { usePathname, useRouter } from "next/navigation";
import { isToday, isYesterday, isAfter, subDays } from "date-fns";
import SidebarContent from "./sidebar.content";
import Image from "next/image";
import { Button } from "./ui/button";
import { BookmarkPlus, MessageCirclePlus, MessageCircleQuestionMark, PanelLeft, PanelRight, PanelRightClose } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dispatch, SetStateAction } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useConversationStore } from "@/stores/conversationStore";
import PromptItem from "./sidebar.user.prompts";
import { useUserStore } from "@/stores/userStore";


// ── Collapsed sidebar: sticky narrow icon strip ──────────────────────────────
function ShortSidebarStyle({ user, setSidebarOpen, sidebarOpen, isChatLoading }: ShortSidebarStyleProps) {
    const createConversation = useConversationStore((s) => s.createConversation);
    const userPrompts = useConversationStore((s) => s.userPrompts);
    return (
        <div className="h-full select-none flex flex-col bg-blue-100/30">
            <div className="sticky top-0 h-auto w-16 overflow-hidden flex flex-col items-center pt-4 gap-4 ">

                {/* Logo icon */}
                <Image
                    src="/Loomora_icon_removebg.png"
                    alt="Loomora Icon"
                    width={80}
                    height={80}
                    loading="eager"
                    className="shrink-0"
                />

                {/* Expand sidebar */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hover:bg-blue-100 hover:rounded-full"
                    title="Open sidebar"
                >
                    <PanelLeft className="size-5 text-gray-500" />
                </Button>

                {/* New chat */}
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={isChatLoading}
                    onClick={() => createConversation()}
                    className="hover:bg-blue-100 hover:rounded-full"
                    title="New chat"
                >
                    <MessageCirclePlus className="size-5 text-gray-500" />
                </Button>

                {/* Prompts panel */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={isChatLoading}
                            className="hover:bg-blue-100 hover:rounded-full"
                            title="Prompts"
                        >
                            <MessageCircleQuestionMark className="size-5 text-gray-500" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent showCloseButton={false} side="right" className="w-96 justify-center flex flex-col gap-0 p-0">
                        <SheetHeader className="px-5 py-4 ">
                            <SheetTitle className="text-base font-semibold flex items-center gap-2">
                                <MessageCircleQuestionMark className="size-6" />
                                Prompts
                            </SheetTitle>
                        </SheetHeader>
                        <SheetClose asChild>
                            <Button variant="ghost" className="absolute right-4 top-2 hover:bg-transparent z-10">
                                <PanelRightClose className="size-6 text-gray-500" />
                            </Button>
                        </SheetClose>
                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            {/* TODO: replace with real saved prompts list */}
                            {userPrompts.length > 0 ? (
                                <div>
                                    {
                                        userPrompts.map((prompt, index) => (
                                            <PromptItem key={index} prompt={prompt} />))
                                    }
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-gray-400">
                                    <MessageCircleQuestionMark className="size-10 stroke-1" />
                                    <p className="text-sm font-medium">No saved prompts yet</p>
                                    <p className="text-xs">Start Conversation and save your prompt</p>
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>



            </div>

            <Button variant='none' onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-none flex-1 flex items-end z-20 ">
                <Avatar className="w-9  h-9  border-2 border-gray-400">
                    <AvatarImage src={user?.profile_picture} className="object-cover " />
                    <AvatarFallback className="text-xl font-medium text-slate-500">
                        {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </Button>
        </div>
    );
}


// ── Props for the exported component ─────────────────────────────────────────
interface ChatSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}


export default function ChatSidebar({ sidebarOpen, setSidebarOpen }: ChatSidebarProps) {
    const pathname = usePathname();
    const isChatLoading = false;

    const conversations = useConversationStore((s) => s.conversations);
    const chats: ChatSidebarTemplate[] = conversations.map((conv) => ({
        thread_id: conv.thread_id,
        title: conv.title,
        createdAt: conv.created_at,
        is_active: conv.is_active,
    }));

    const user = useUserStore((s) => s.user);

    let todayChats: ChatSidebarTemplate[] = [];
    let yesterdayChats: ChatSidebarTemplate[] = [];
    let last30DaysChats: ChatSidebarTemplate[] = [];
    let olderChats: ChatSidebarTemplate[] = [];

    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);

    chats.forEach((chat: any) => {
        const date = new Date(chat.createdAt);
        if (isToday(date)) todayChats.push(chat);
        else if (isYesterday(date)) yesterdayChats.push(chat);
        else if (isAfter(date, thirtyDaysAgo)) last30DaysChats.push(chat);
        else olderChats.push(chat);
    });

    const sharedProps = {
        pathname,
        setSidebarOpen,
        sidebarOpen,
        isChatLoading,
        todayChats,
        yesterdayChats,
        last30DaysChats,
        olderChats,
    };

    return (
        <>
            {/* ── Mobile: Sheet drawer ─────────────────────────────────────── */}
            <div className="md:hidden z-30 fixed">
                <Sheet>
                    <SheetTrigger asChild>
                        <div className="sticky border-2 border-gray-300 overflow-hidden m-2 rounded-full pr-3 h-12 pb-5 top-0 flex  items-center pt-4 ">
                            <Image src="/Loomora_icon_removebg.png" alt="Sidebar Logo" width={80} height={80} loading="eager" />
                            <Button variant="ghost" size="icon" className="hover:rounded-full">
                                <PanelLeft className="size-5 text-gray-500" />
                            </Button>
                        </div>
                    </SheetTrigger>

                    <SheetContent side="left" showCloseButton={false} className="md:hidden h-screen w-72 p-0">
                        <SheetTitle asChild>
                            <VisuallyHidden>Chat Navigation Menu</VisuallyHidden>
                        </SheetTitle>
                        <SheetClose asChild>
                            <Button variant="ghost" className="absolute right-4 top-4 hover:bg-transparent z-10">
                                <PanelRight className="size-5  text-gray-500" />
                            </Button>
                        </SheetClose>
                        <SidebarContent {...sharedProps} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* ── Desktop: Toggle between full and collapsed ───────────────── */}
            <div className="hidden md:block h-full">
                {sidebarOpen
                    ? <SidebarContent {...sharedProps} />
                    : <ShortSidebarStyle setSidebarOpen={setSidebarOpen} user={user} sidebarOpen={sidebarOpen} isChatLoading={isChatLoading} />
                }
            </div>
        </>
    );
}