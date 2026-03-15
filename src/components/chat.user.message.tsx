'use client'

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import { Copy, ExternalLink, Pen, Star } from "lucide-react";

interface Props {
  message: any;
  user: any;
}

export default function UserMessage({ message, user }: Props) {

  const [copied, setCopied] = useState(false);
  const [favorite, setFavorite] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        text: message.content,
      });
    } else {
      navigator.clipboard.writeText(message.content);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1 mb-4 ">

      {/* Message Row */}
      <div className="flex justify-end items-end gap-2 w-full">

        <div className="px-4 pt-3 pb-1 rounded-xl text-sm leading-relaxed overflow-hidden wrap-break-word  max-w-[75%] bg-blue-500 text-white rounded-br-xs">

          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              a: ({ href, children }) => (
                <a href={href} className="text-black underline hover:text-slate-800" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-2">{children}</h2>,
              p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc ml-6 mb-3">{children}</ul>,
            }}
          >
            {message.content.replace(/(\S)(#{1,6}\s)/g, "$1\n\n$2")}
          </ReactMarkdown>

        </div>

        <Avatar className="w-8 h-8 shrink-0 border border-gray-200">
          <AvatarImage className="object-cover" src={user?.profile_picture} />
          <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-700">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>

      </div>

      {/* Action Buttons */}
      <div className="flex  items-center gap-3 mr-10 mt-1 text-gray-500">

        <button
          onClick={handleCopy}
          className="flex items-center cursor-pointer gap-1 text-xs hover:text-gray-800"
        >
          <Copy className="size-3" />
          {copied ? "Copied" : ""}
        </button>

        <button
          onClick={() => setFavorite(!favorite)}
          className="flex items-center cursor-pointer gap-1 text-xs hover:text-gray-800"
        >
          <Star
            className={`size-3 ${favorite ? "fill-yellow-400 text-yellow-400" : ""
              }`}
          />
        </button>

        <button
          onClick={handleShare}
          className="flex items-center cursor-pointer gap-1 text-xs hover:text-gray-800"
        >
          <Pen className="size-3" />
        </button>

      </div>

    </div>
  );
}