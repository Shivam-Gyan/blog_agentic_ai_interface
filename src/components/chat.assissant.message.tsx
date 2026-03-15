'use client'

import { useState, useEffect } from "react";
import {
  BotMessageSquareIcon,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Wrench,
  Loader2, 
  CheckCircle2,
  Check,
  Settings,
  FileText,
  Brain,
  Volume2Icon
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import type { Message, VerboseStep } from "@/interfaces/conversation.interface";
import DotsLoader from "@/common/dot.loader";
import { SpeakerButton } from "./Speaker.component";

interface Props {
  message: Message;
  isLoading?: boolean;
}

const verboseStepsSample: VerboseStep[] = [
  {
    id: "step1",
    content: "Detecting intent...",
    detail: null,
    state: "done",
  },
  {
    id: "step2",
    content: "Calling tool: tavily_search...",
    detail: JSON.stringify({ query: "Best Italian restaurants in NYC?" }),
    state: "active",
  },
  {
    id: "step3",
    content: "Processing tool response...",
    detail: null,
    state: "done",
  },
  {
    id: "step4",
    content: "Generating final answer...",
    detail: null,
    state: "done",
  },
];

// ── Thinking panel ────────────────────────────────────────────────────────────

function ThinkingPanel({
  steps,
  done ,
}: {
  steps: VerboseStep[];
  done: boolean;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => setOpen(false), 600);
      return () => clearTimeout(t);
    }
  }, [done]);

  if (steps.length === 0) return null;

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 overflow-hidden max-w-[90%]">

      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-500
                   hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        {/* Loader or check icon */}
        {done ? (
          <Check className="size-3.5 shrink-0 text-gray-700" />
        ) : (
          <Loader2 className="size-4 shrink-0 text-gray-700 animate-spin" />
        )}

        <span className="font-medium">
          {done 
            ? `Intelligence process complete (${steps.length} steps)` 
            : steps.some(s => s.content.toLowerCase().startsWith("calling tool")) 
              ? "Consulting tools & executing plan..." 
              : "Reasoning and formulating..."
          }
        </span>
        <span className="ml-auto">
          {open
            ? <ChevronUp className="size-3" />
            : <ChevronDown className="size-3" />}
        </span>
      </button>

      {/* Steps list */}
      {open && (
        <div className="border-t border-gray-200 px-3 py-2 flex flex-col gap-1">
          {steps.map((step) => (
            <StepRow key={step.id} step={step} />
          ))}
        </div>
      )}
    </div>
  );
}



// ── Single step row ───────────────────────────────────────────────────────────
function StepRow({ step }: { step: VerboseStep }) {
  const isTool = step.content.toLowerCase().startsWith("calling tool");
  const isActive = step.state === "active";

  return (
    <div className="flex items-start gap-2 py-1">

      {/* Status indicator */}
      {(isActive && isTool) ? (
        <Settings className="size-3 text-gray-700 animate-spin mt-1 shrink-0" />
      ) : (isActive) ? (
        <Loader2 className="size-3 rounded-full animate-spin mt-1 shrink-0" />
      ) : (
        <Check className="size-3 text-gray-700 mt-1 shrink-0" />
      )}

      <div className="flex flex-col min-w-0">
        {/* Step label */}
        <span
          className={`text-xs leading-relaxed ${isActive
            ? "text-gray-800 font-medium"
            : "text-gray-500"
            }`}
        >
          {step.content}
        </span>

        {/* Tool detail — query shown in mono below the label */}
        {step.detail && (
          <span className="text-[11px] font-mono text-gray-400 mt-0.5 truncate">
            {(() => {
              try {
                const parsed = JSON.parse(step.detail);
                return parsed.query ?? step.detail;
              } catch {
                return step.detail;
              }
            })()}
          </span>
        )}
      </div>
    </div>
  );
}


const MarkdownComponents = ({message}: { message: Message })=>{
    return (
      <div className="prose prose-sm max-w-none wrap-break-word
                prose-p:mb-3          prose-p:leading-relaxed
                prose-h1:text-xl      prose-h1:font-bold      prose-h1:mt-4 prose-h1:mb-2
                prose-h2:text-lg      prose-h2:font-semibold  prose-h2:mt-4 prose-h2:mb-2
                prose-ul:list-disc    prose-ul:ml-5            prose-ul:mb-3
                prose-ol:list-decimal prose-ol:ml-5            prose-ol:mb-3
                prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:text-xs
                prose-code:text-xs    prose-code:bg-gray-200  prose-code:px-1 prose-code:rounded
                prose-table:block     prose-table:overflow-x-auto prose-table:w-full
                prose-a:text-blue-600 prose-a:underline">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-blue-600 underline hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto w-full">
                        <table className="min-w-full border-collapse">{children}</table>
                      </div>
                    ),
                    pre: ({ children }) => (
                      <pre className="overflow-x-auto rounded-lg p-3 bg-gray-800 text-gray-100 text-xs">
                        {children}
                      </pre>
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
    )
}



// ── Main component ────────────────────────────────────────────────────────────
export default function AIMessage({ message, isLoading }: Props) {
  const [copied, setCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showFinalBlogPost, setShowFinalBlogPost] = useState(false);

  const verboseSteps = message.verboseSteps ?? [];
  // const verboseSteps = message.verboseSteps ?? verboseStepsSample;
  const thinkingDone = message.thinkingDone ?? false;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: message.content });
    } else {
      navigator.clipboard.writeText(message.content);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1 w-full">
      <div className="flex justify-start items-start gap-2 w-full">

        {/* Bot icon with loading ring */}
        <div className="relative w-8 h-8 shrink-0 flex items-center justify-center mt-1">
          {isLoading && (
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                background:
                  "conic-gradient(from 0deg, #f43f5e, #f97316, #eab308, #22c55e, #3b82f6, #a855f7, #f43f5e)",
                padding: "2px",
                borderRadius: "9999px",
              }}
            >
              <div className="w-full h-full rounded-full bg-white" />
            </div>
          )}
          <div className="relative z-10 w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center bg-white">
            <BotMessageSquareIcon className="size-4 text-gray-500" />
          </div>
        </div>

        {/* Message column */}
        <div className="flex flex-col gap-2 min-w-0 flex-1 max-w-[calc(100%-2.5rem)]">

          {/* ── Verbose thinking panel ── */}
          <ThinkingPanel steps={verboseSteps} done={thinkingDone} />

          {/* ── Internal reasoning (worker tokens) — collapsible ── */}
          {message.reasoning && (
            <div className="rounded-md border border-gray-200 bg-gray-50 overflow-hidden max-w-[90%]">
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-500
                           hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                  <Brain className="size-3.5" />
                    Mapping logic paths 
                </span>
                {showReasoning
                  ? <ChevronUp className="size-3 ml-auto" />
                  : <ChevronDown className="size-3 ml-auto" />}
              </button>
              {showReasoning && (
                <div className="px-3 pb-3 text-xs text-gray-400 font-mono leading-relaxed
                                whitespace-pre-wrap border-t border-gray-200 pt-2
                                max-h-48 overflow-y-auto">
                  {message.reasoning}
                </div>
              )}
            </div>
          )}
          {message.final_blog_post && (
            <div className="rounded-md border border-gray-200 bg-white  max-w-[90%] shadow-sm">
              
              {/* Header toggle */}
              <button
                onClick={() => setShowFinalBlogPost(!showFinalBlogPost)}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-xs
                          bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
              >
                <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                  <FileText className="size-3.5" />
                  Final blog post
                </span>

                <div className=""><SpeakerButton text={message.final_blog_post} /></div>
                {showFinalBlogPost
                  ? <ChevronUp className="size-3.5 ml-auto text-gray-400" />
                  : <ChevronDown className="size-3.5 ml-auto text-gray-400" />}
              </button>

              {/* Blog content — no mono/pre-wrap/muted color overrides */}
              {showFinalBlogPost && (
                <div className="px-6 py-4
                                prose prose-sm prose-gray max-w-none">
                  <MarkdownComponents
                    message={{
                      content: message.final_blog_post,
                      role: "assistant",
                      id: "",
                      timestamp: 0,
                    }}
                  />
                </div>
              )}
            </div>
          )}


          {/* ── Main answer bubble ── */}
          {(message.content || isLoading) && (
            <div className="px-4 py-3 rounded-xl text-sm leading-relaxed
                            bg-gray-100 text-gray-900 rounded-tl-xs
                            overflow-hidden max-w-[90%]">
              
              <MarkdownComponents message={message} />
              {/* Loading cursor when no content yet */}
              {isLoading && !message.content && (<DotsLoader />)}
            </div>
          )}
        </div>
      </div>


      {/* Action bar */}
      {!isLoading && message.content && (
        <div className="flex items-center gap-3 ml-10 mt-1 text-gray-400">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs hover:text-gray-700 transition-colors"
          >
            <Copy className="size-3.5" />
            {copied && <span className="text-green-600">Copied</span>}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-xs hover:text-gray-700 transition-colors"
          >
            <ExternalLink className="size-3.5" />
          </button>
          {/* <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs hover:text-gray-700 transition-colors"
          >
            <Volume2Icon className="size-3.5" />
            {copied && <span className="text-green-600">Copied</span>}
          </button> */}
          <SpeakerButton text={message.content} />
        </div>
      )}
    </div>
  );
}



// 'use client'

// import { useState, useEffect } from "react";
// import {
//   BotMessageSquareIcon,
//   ChevronDown,
//   ChevronUp,
//   Copy,
//   ExternalLink,
//   Wrench,
// } from "lucide-react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import remarkBreaks from "remark-breaks";
// import rehypeHighlight from "rehype-highlight";
// import type { VerboseStep } from "@/interfaces/conversation.interface";

// interface Props {
//   message: {
//     content: string;
//     reasoning?: string;
//     verboseSteps?: VerboseStep[];
//     thinkingDone?: boolean;
//   };
//   isLoading?: boolean;
// }

// // ── Thinking panel ────────────────────────────────────────────────────────────
// function ThinkingPanel({
//   steps,
//   done,
// }: {
//   steps: VerboseStep[];
//   done: boolean;
// }) {
//   const [open, setOpen] = useState(true);

//   useEffect(() => {
//     if (done) {
//       const t = setTimeout(() => setOpen(false), 800);
//       return () => clearTimeout(t);
//     }
//   }, [done]);

//   if (steps.length === 0) return null;

//   return (
//     <div className={`rounded-xl border transition-all duration-500 max-w-[92%] ${
//       done ? "border-gray-200 bg-gray-50/50" : "border-blue-100 bg-blue-50/30 animate-pulse-slow"
//     } overflow-hidden`}>

//       {/* Header */}
//       <button
//         onClick={() => setOpen(o => !o)}
//         className="flex items-center gap-2 w-full px-3 py-2.5 text-xs transition-colors hover:bg-gray-100/50"
//       >
//         <div className="relative flex items-center justify-center">
//           {/* Animated rings for active state */}
//           {!done && (
//              <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
//           )}
//           <span
//             className={`w-2 h-2 rounded-full shrink-0 relative transition-colors duration-500 ${
//               done ? "bg-emerald-500" : "bg-blue-500"
//             }`}
//           />
//         </div>
        
//         <span className={`font-medium tracking-tight ${done ? "text-gray-600" : "text-blue-700"}`}>
//           {done ? `Process completed in ${steps.length} steps` : "Thinking and executing..."}
//         </span>
        
//         <span className="ml-auto text-gray-400">
//           {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
//         </span>
//       </button>

//       {/* Steps list */}
//       {open && (
//         <div className="border-t border-gray-100 px-4 pb-3 pt-2 flex flex-col gap-1.5 max-h-60 overflow-y-auto custom-scrollbar">
//           {steps.map((step) => (
//             <StepRow key={step.id} step={step} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Single step row ───────────────────────────────────────────────────────────
// function StepRow({ step }: { step: VerboseStep }) {
//   const isTool = step.content.toLowerCase().startsWith("calling tool");
//   const isActive = step.state === "active";

//   return (
//     <div className={`flex items-start gap-3 py-1 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-70"}`}>
//       <div className="mt-1 shrink-0">
//         {isActive ? (
//           <div className="size-3 flex items-center justify-center">
//              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
//           </div>
//         ) : isTool ? (
//           <Wrench className="size-3.5 text-purple-500" />
//         ) : (
//           <div className="size-3.5 flex items-center justify-center">
//             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
//           </div>
//         )}
//       </div>

//       <div className="flex flex-col min-w-0">
//         <span className={`text-[12px] leading-snug ${isActive ? "text-gray-900 font-medium" : "text-gray-500"}`}>
//           {step.content}
//         </span>

//         {step.detail && (
//           <div className="mt-1 px-2 py-1 bg-gray-100/80 rounded border border-gray-200/50 w-fit max-w-full">
//             <span className="text-[10px] font-mono text-gray-600 break-all">
//               {(() => {
//                 try {
//                   const parsed = JSON.parse(step.detail);
//                   return parsed.query ?? step.detail;
//                 } catch {
//                   return step.detail;
//                 }
//               })()}
//             </span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function AIMessage({ message, isLoading }: Props) {
//   const [copied, setCopied] = useState(false);
//   const [showReasoning, setShowReasoning] = useState(false);

//   const verboseSteps = message.verboseSteps ?? [];
//   const thinkingDone = message.thinkingDone ?? false;

//   const handleCopy = () => {
//     navigator.clipboard.writeText(message.content);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1200);
//   };

//   const handleShare = async () => {
//     if (navigator.share) {
//       await navigator.share({ text: message.content });
//     } else {
//       navigator.clipboard.writeText(message.content);
//     }
//   };

//   return (
//     <div className="flex flex-col items-start gap-1 w-full group">
//       <div className="flex justify-start items-start gap-3 w-full">

//         {/* Bot icon with modern gradient ring */}
//         <div className="relative w-8 h-8 shrink-0 flex items-center justify-center mt-1">
//           {isLoading && (
//             <div className="absolute inset-0 rounded-full animate-spin-slow p-[1.5px] bg-gradient-to-tr from-pink-500 via-violet-500 to-cyan-500">
//                <div className="w-full h-full rounded-full bg-white" />
//             </div>
//           )}
//           <div className={`relative z-10 w-7 h-7 border rounded-full flex items-center justify-center bg-white transition-all duration-300 ${isLoading ? "border-transparent shadow-sm" : "border-gray-200"}`}>
//             <BotMessageSquareIcon className={`size-4 transition-colors ${isLoading ? "text-violet-500" : "text-gray-500"}`} />
//           </div>
//         </div>

//         {/* Message column */}
//         <div className="flex flex-col gap-3 min-w-0 flex-1 max-w-[calc(100%-3rem)]">

//           <ThinkingPanel steps={verboseSteps} done={thinkingDone} />

//           {message.reasoning && (
//             <div className="rounded-xl border border-gray-200 bg-white/50 overflow-hidden max-w-[90%] shadow-sm">
//               <button
//                 onClick={() => setShowReasoning(!showReasoning)}
//                 className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all"
//               >
//                 <span className="italic font-medium">Internal Thought Process</span>
//                 {showReasoning ? <ChevronUp className="size-3 ml-auto" /> : <ChevronDown className="size-3 ml-auto" />}
//               </button>
//               {showReasoning && (
//                 <div className="px-4 pb-4 text-[11px] text-gray-500 font-mono leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-3 max-h-48 overflow-y-auto bg-gray-50/30">
//                   {message.reasoning}
//                 </div>
//               )}
//             </div>
//           )}

//           {(message.content || isLoading) && (
//             <div className="px-4 py-3.5 rounded-2xl text-sm leading-relaxed bg-white border border-gray-200 shadow-sm text-gray-900 rounded-tl-none overflow-hidden max-w-[95%] transition-all duration-300">
//               <div className="prose prose-sm max-w-none wrap-break-word 
//                 prose-p:mb-4 prose-p:text-gray-800 prose-p:leading-7
//                 prose-headings:text-gray-900 prose-headings:font-bold
//                 prose-pre:bg-[#1e1e1e] prose-pre:shadow-lg prose-pre:border prose-pre:border-white/10
//                 prose-code:text-violet-600 prose-code:bg-violet-50 prose-code:px-1.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
//                 prose-a:text-blue-600 prose-a:font-medium hover:prose-a:text-blue-700">
//                 <ReactMarkdown
//                   remarkPlugins={[remarkGfm, remarkBreaks]}
//                   rehypePlugins={[rehypeHighlight]}
//                   components={{
//                     a: ({ href, children }) => (
//                       <a
//                         href={href}
//                         className="text-blue-600 underline hover:text-blue-800"
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         {children}
//                       </a>
//                     ),
//                     table: ({ children }) => (
//                       <div className="overflow-x-auto w-full">
//                         <table className="min-w-full border-collapse">{children}</table>
//                       </div>
//                     ),
//                     pre: ({ children }) => (
//                       <pre className="overflow-x-auto rounded-lg p-3 bg-gray-800 text-gray-100 text-xs">
//                         {children}
//                       </pre>
//                     ),
//                     h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>,
//                     h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-2">{children}</h2>,
//                     p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
//                     ul: ({ children }) => <ul className="list-disc ml-6 mb-3">{children}</ul>,
//                   }}
//                 >
//                   {message.content.replace(/(\S)(#{1,6}\s)/g, "$1\n\n$2")}
//                 </ReactMarkdown>
//               </div>

//               {isLoading && !message.content && (
//                 <div className="flex items-center gap-1 py-1">
//                   <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
//                   <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
//                   <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {!isLoading && message.content && (
//         <div className="flex items-center gap-4 ml-11 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-400">
//           <button onClick={handleCopy} className="flex items-center gap-1.5 text-[11px] font-medium hover:text-gray-700">
//             <Copy className="size-3.5" />
//             {copied ? <span className="text-emerald-600 animate-in fade-in zoom-in-95">Copied!</span> : "Copy"}
//           </button>
//           <button onClick={handleShare} className="flex items-center gap-1.5 text-[11px] font-medium hover:text-gray-700">
//             <ExternalLink className="size-3.5" />
//             Share
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }