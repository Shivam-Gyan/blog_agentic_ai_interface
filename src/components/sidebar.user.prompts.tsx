'use client';

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/stores/userStore";

interface PromptItemProps {
  prompt: string;
}

export default function PromptItem({ prompt }: PromptItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const user = useUserStore((s) => s.user);

  const handleOnExpendClick = () => {
    setExpanded((prev) => !prev);

    navigator.clipboard.writeText(prompt);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  return (
    <div
      onClick={handleOnExpendClick}
      className="relative cursor-pointer py-2 duration-200 bg-white flex items-center gap-2.5"
    >
      <Avatar className="w-7 h-7 shrink-0 mt-0.5 border border-gray-200">
        <AvatarImage src={user?.profile_picture} />
        <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-700">
          {user?.name?.charAt(0).toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>

      <p
        className={`text-sm border transition-all hover:bg-gray-50 border-gray-200 rounded-md p-3 flex-1 ${
          expanded ? "whitespace-pre-wrap wrap-break-word" : "truncate"
        }`}
      >
        {prompt}
      </p>

      {/* Copy Popup */}
      {copied && (
        <span className="absolute -top-2 right-3 text-xs bg-indigo-600 text-white px-2 py-1 rounded-md animate-fadeInOut">
          Copied!
        </span>
      )}
    </div>
  );
}