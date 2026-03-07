'use client';

import { ChatInterfaceProps } from "@/interfaces/chat.interface";
import useSpeechRecognition from "@/lib/speech.recognition";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ArrowUp, AudioLines, Bot, PenLine, Plus, Sparkles, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { Switch } from "./ui/switch";
import { useAgentStore } from "@/stores/agentStore";


const tools = [
    { id: "google-search", name: "Google Search" },
    { id: "wikipedia", name: "Wikipedia" },
    { id: "weather", name: "Weather" },
];

const resources = [
    { id: "file-1", name: "Project Docs" },
    { id: "file-2", name: "Budget Spreadsheet" },
];


export default function ChatInterface({ onSubmit, isLoading }: ChatInterfaceProps) {

    const [input, setInput] = useState<string>("");
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [isSpeechActive, setIsSpeechActive] = useState(false);
    const { transcript, isListening, error } = useSpeechRecognition(isSpeechActive);

    
    const [isMcpEnabled, setIsMcpEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState<"tools" | "resources">("tools");
    const mode    = useAgentStore((s) => s.mode);
    const setMode = useAgentStore((s) => s.setMode);
    
    const submitMessage = () => {
        if (!input.trim()) return;
        onSubmit({input});
        setInput("");
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submitMessage();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitMessage();
        }
    };

    useEffect(() => {
        if (transcript) setInput(prev => prev + " " + transcript);
    }, [transcript]);

    useEffect(() => {
        const textarea = textAreaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        }
    }, [input]);

    return (
        <div className="">
            <form onSubmit={handleSubmit} className="w-full">
                <Textarea
                    ref={textAreaRef}
                    placeholder={isListening ? "Listening..." : "Ask Anything..."}
                    className="w-full overflow-y-scroll resize-none text-sm bg-transparent border-none outline-none focus:ring-0 focus-visible:outline-none shadow-none px-2 py-2"
                    value={input}
                    style={{ scrollbarWidth: "none" }}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    rows={1}
                />
                <div className="mt-2 flex items-center justify-between">
                    {/* Left — MCP dropdown */}
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full border border-gray-400 cursor-pointer"
                                >
                                    <Plus className="size-5 text-gray-600" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="top"
                                align="start"
                                className="w-64 rounded-xl shadow-lg border border-gray-200 p-0 overflow-hidden"
                            >
                                {/* MCP Toggle row */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                    <span className="text-sm font-medium text-gray-800">Feather-fabes-mcp</span>
                                    <Switch
                                        checked={isMcpEnabled}
                                        onCheckedChange={(checked) => {
                                            setIsMcpEnabled(checked);
                                            setActiveTab("tools"); // reset tab on toggle
                                        }}
                                    />
                                </div>

                                {/* Tabs + Content — only visible when enabled */}
                                {isMcpEnabled && (
                                    <>
                                        {/* Tab bar */}
                                        <div className="flex border-b border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("tools")}
                                                className={cn(
                                                    "flex-1 py-2 text-xs font-medium transition-colors",
                                                    activeTab === "tools"
                                                        ? "text-blue-600 border-b-2 border-blue-600"
                                                        : "text-gray-500 hover:text-gray-700"
                                                )}
                                            >
                                                Tools
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("resources")}
                                                className={cn(
                                                    "flex-1 py-2 text-xs font-medium transition-colors",
                                                    activeTab === "resources"
                                                        ? "text-blue-600 border-b-2 border-blue-600"
                                                        : "text-gray-500 hover:text-gray-700"
                                                )}
                                            >
                                                Resources
                                            </button>
                                        </div>

                                        {/* Tab content */}
                                        <div className="max-h-48 overflow-y-auto">
                                            {activeTab === "tools" && (
                                                tools.length > 0 ? (
                                                    tools.map((tool) => (
                                                        <DropdownMenuItem
                                                            key={tool.id}
                                                            className="px-4 py-2 text-sm cursor-pointer"
                                                        >
                                                            {tool.name}
                                                        </DropdownMenuItem>
                                                    ))
                                                ) : (
                                                    <p className="px-4 py-4 text-xs text-gray-400 text-center">
                                                        No tools available
                                                    </p>
                                                )
                                            )}

                                            {activeTab === "resources" && (
                                                resources.length > 0 ? (
                                                    resources.map((res: any) => (
                                                        <DropdownMenuItem
                                                            key={res.id}
                                                            className="px-4 py-2 text-sm cursor-pointer"
                                                        >
                                                            {res.name}
                                                        </DropdownMenuItem>
                                                    ))
                                                ) : (
                                                    <p className="px-4 py-4 text-xs text-gray-400 text-center">
                                                        No resources available
                                                    </p>
                                                )
                                            )}
                                        </div>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setMode('chat')}
                            className={cn(
                                "h-9 w-9 rounded-full ml-3 md:ml-5 hover:bg-indigo-600 hover:text-white border cursor-pointer",
                                mode === 'chat'
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'border-gray-400 text-gray-600 hover:border-gray-500'
                            )}
                        >
                            <Bot className="size-5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setMode('generate')}
                            className={cn(
                                "h-9 w-9 rounded-full hover:bg-indigo-600 hover:text-white  border cursor-pointer",
                                mode === 'generate'
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'border-gray-400 text-gray-600 hover:border-gray-500'
                            )}
                        >
                            <PenLine className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setMode('refine')}
                            className={cn(
                                "h-9 w-9 rounded-full border cursor-pointer",
                                mode === 'refine'
                                    ? 'bg-indigo-600 hover:bg-indigo-600 hover:text-white  text-white border-indigo-600'
                                    : 'border-gray-400 text-gray-600 hover:border-gray-500'
                            )}
                        >
                            <Sparkles className="size-5" />
                        </Button>
                    </div>



                    {/* Right — speech + submit */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={isLoading}
                            onClick={() => setIsSpeechActive((prev) => !prev)}
                            className="h-9 w-9 rounded-full border border-gray-400 cursor-pointer"
                        >
                            {isListening
                                ? <Square className="size-5 text-blue-600" />
                                : <AudioLines className="size-5 text-gray-600" />
                            }
                        </Button>

                        <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className={cn(
                                "bg-blue-600 text-white h-9 w-9 p-2 rounded-full hover:border-2 border-gray-400 cursor-pointer",
                                !input.trim() && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <ArrowUp className="size-5" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}