'use client'

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import { Copy, Pen, Star, ArrowUp, Square, X } from "lucide-react";
import UseButtonComponent from "@/common/button.common";
import { useEditRetry } from "@/hooks/useEditRetry";

interface Props {
  message: any;
  user: any;
}

export default function UserMessage({ message, user }: Props) {

  const [copied, setCopied] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [isEditContent, setIsEditContent] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const { handleEditRetry, handleStopEditRetry, isEditingRetrying } = useEditRetry();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleBeginEdit = () => {
    console.log("Edit/Retry clicked for message:", message);
    setEditedContent(message.content);
    setIsEditContent(true);
  };

  const handleEditSubmit = async () => {
    if (!message.edit_id) {
      console.log("Edit retry skipped because edit checkpoint is missing:", message);
      return;
    }

    console.log("Edited message submitted:", editedContent);
    setIsEditContent(false);
    void handleEditRetry({
      messageId: message.id,
      editCheckpointId: message.edit_id,
      newUserQuery: editedContent,
    });
  };

  const handleEditStop = () => {
    if (isEditingRetrying) {
      console.log("Stopping edit retry stream for message:", message);
      handleStopEditRetry();
      return;
    }

    console.log("Edit canceled for message:", message);
    setEditedContent(message.content);
    setIsEditContent(false);
  };

  return (
    <div className="flex flex-col items-end gap-1 mb-4">

      {/* Message Row */}
      <div className="flex justify-end items-end gap-2 w-full">

        <div
          className={`px-4 pt-3 pb-2 rounded-xl text-sm leading-relaxed overflow-hidden wrap-break-word max-w-[75%]
          transition-all duration-200
          ${isEditContent
              ? "bg-gray-50 border-2 border-blue-500 shadow-sm w-full md:w-[75%]"
              : "bg-blue-500 text-white border border-transparent max-w-[75%]"
            } rounded-br-xs`}
        >

          {isEditContent ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleEditSubmit();
              }}
              className="w-full"
            >
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                autoFocus
                rows={4}
                className="w-full overflow-y-scroll resize-none text-sm bg-transparent border-none outline-none focus:ring-0 focus-visible:outline-none shadow-none px-2 py-2 text-gray-800 placeholder-gray-400"
              />

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleEditStop}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 h-9 w-9 flex items-center justify-center rounded-full transition-all"
                >
                  {isEditingRetrying ? <Square className="size-4" /> : <X className="size-4" />}
                </button>

                <button
                  type="submit"
                  disabled={!editedContent.trim() || !message.edit_id || isEditingRetrying}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white h-9 w-9 flex items-center justify-center rounded-full transition-all"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
            </form>

          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-black underline hover:text-slate-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
          )}

        </div>

        {/* Avatar */}
        <Avatar className="w-8 h-8 shrink-0 border border-gray-200">
          <AvatarImage className="object-cover" src={user?.profile_picture} />
          <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-700">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center mr-10 mt-1 text-gray-500">

        <UseButtonComponent handlefunc={handleCopy} state={copied} text="copied">
          <Copy className="size-3.5" />
        </UseButtonComponent>

        <UseButtonComponent handlefunc={() => setFavorite(!favorite)}>
          <Star
            className={`size-3.5 ${favorite ? "fill-yellow-400 text-yellow-400" : ""
              }`}
          />
        </UseButtonComponent>

        {isEditingRetrying ? (
          <button
            onClick={handleEditStop}
            className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
          >
            <Square className="size-3.5" />
          </button>
        ) : isEditContent ? (
          <button
            onClick={handleEditStop}
            className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <button
            onClick={handleBeginEdit}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Pen className="size-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}