'use client';

import { ChatInterfaceProps } from "@/interfaces/chat.interface";
import useSpeechRecognition from "@/lib/speech.recognition";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ArrowUp, AudioLines, Plus, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";




export default function ChatInterface({ onSubmit, isLoading }: ChatInterfaceProps) {

    const [input, setInput] = useState<string>("");
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [isSpeechActive, setIsSpeechActive] = useState(false);
    const { transcript, isListening, error } = useSpeechRecognition(isSpeechActive);

    const submitMessage = () => {
        if (!input.trim()) return;
        onSubmit(input);
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
        if (transcript) {
            setInput(prev => prev + " " + transcript);
        }
    }, [transcript]);


    useEffect(() => {
        const textarea = textAreaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        }
    }, [input]);

    return (
        <>
            <div
                className={`w-full max-w-4xl md:ml-64 rounded-xl bg-[#efeff0] py-4 px-4 shadow-[0_-1px_6px_rgba(0,0,0,0.05)]`}
            >
                <form onSubmit={handleSubmit} className="w-full">
                    <Textarea
                        ref={textAreaRef}
                        placeholder={
                            isListening ? "Listening..." : "Ask Anything to deepseek"
                        }
                        className="w-full overflow-y-scroll resize-none  text-sm bg-transparent border-none outline-none right-0 focus:outline:none focus:border:none focus:ring-0 focus-visible:outline-none shadow-none px-2 py-2"
                        value={input}
                        style={{scrollbarWidth:"none"}}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        rows={1}
                    />

                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={isLoading}
                                className="h-9 w-9 rounded-full border border-gray-500"
                            >
                                <Plus className="h-5 w-5 font-bold text-gray-600" />
                            </Button>

                            {/* <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={isLoading}
                                className="h-9 w-9 rounded-md border border-gray-300"
                            >
                                <Brain className="h-5 w-5 text-gray-600" />
                            </Button> */}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={isLoading}
                                onClick={() => setIsSpeechActive((prev) => !prev)}
                                className="h-9 w-9 rounded-full border border-gray-400 cursor-pointer"
                            >
                                {isListening ? (
                                    <Square className="h-5 w-5 text-blue-600" />
                                ) : (
                                    <AudioLines className="h-5 w-5  text-gray-600" />
                                )}
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
                                <ArrowUp className="h-5 w-5 font-bold" />
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}