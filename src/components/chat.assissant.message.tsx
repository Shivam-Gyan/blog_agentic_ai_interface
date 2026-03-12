

// 'use client'

// import { useState } from "react";
// import { BotMessageSquareIcon } from "lucide-react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import remarkBreaks from "remark-breaks";
// import rehypeHighlight from "rehype-highlight";
// import { Copy, ExternalLink, Star } from "lucide-react";


// interface Props {
//   message: any;
//   isLoading?:boolean;
// }

// export default function AIMessage({ message, isLoading}: Props) {

//   const [copied, setCopied] = useState(false);
//   const [favorite, setFavorite] = useState(false);

//   const handleCopy = () => {
//     navigator.clipboard.writeText(message.content);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1200);
//   };

//   const handleShare = async () => {
//     if (navigator.share) {
//       await navigator.share({
//         text: message.content,
//       });
//     } else {
//       navigator.clipboard.writeText(message.content);
//     }
//   };
//   return (
//     <div className="flex flex-col items-start gap-1">
//       <div className="flex justify-start items-end gap-2  w-full">


//         {/* bot icon  */}
//         <div className=" w-8 h-8 shrink-0 border border-gray-400 rounded-full flex items-center justify-center">
//           <BotMessageSquareIcon className="size-5 text-gray-500" />
//         </div>

//         <div className="px-4 py-3 pb-1 select-text rounded-xl text-sm leading-relaxed max-w-[75%] bg-gray-100 text-gray-900 rounded-bl-xs">

//           <ReactMarkdown
//             remarkPlugins={[remarkGfm, remarkBreaks]}
//             rehypePlugins={[rehypeHighlight]}
//             components={{
//               a: ({ href, children }) => (
//                 <a
//                   href={href}
//                   className="text-blue-600 underline hover:text-blue-800"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   {children}
//                 </a>
//               ),
//               h1: ({ children }) => (
//                 <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>
//               ),
//               h2: ({ children }) => (
//                 <h2 className="text-xl font-semibold mt-5 mb-2">{children}</h2>
//               ),
//               p: ({ children }) => (
//                 <p className="mb-3 leading-relaxed">{children}</p>
//               ),
//               ul: ({ children }) => (
//                 <ul className="list-disc ml-6 mb-3">{children}</ul>
//               ),
//             }}
//           >
//             {message.content.replace(/(\S)(#{1,6}\s)/g, "$1\n\n$2")}
//           </ReactMarkdown>

//         </div>



//       </div>

//       {!isLoading && <div className="flex items-center gap-3 ml-12 mt-1 text-gray-500">

//         <button
//           onClick={handleCopy}
//           className="flex items-center gap-1 text-xs hover:text-gray-800"
//         >
//           <Copy className="size-4" />
//           {copied ? "Copied" : ""}
//         </button>

//         <button
//           onClick={() => setFavorite(!favorite)}
//           className="flex items-center gap-1 text-xs hover:text-gray-800"
//         >
//           <Star
//             className={`size-4 ${favorite ? "fill-yellow-400 text-yellow-400" : ""
//               }`}
//           />
//         </button>

//         <button
//           onClick={handleShare}
//           className="flex items-center gap-1 text-xs hover:text-gray-800"
//         >
//           <ExternalLink className="size-4" />
//         </button>

//       </div>}
//     </div>
//   );
// }



'use client'

import { useState } from "react";
import { BotMessageSquareIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import { Copy, ExternalLink, Star } from "lucide-react";

interface Props {
  message: any;
  isLoading?: boolean;
}

export default function AIMessage({ message, isLoading }: Props) {
  const [copied, setCopied] = useState(false);
  const [favorite, setFavorite] = useState(false);

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
    <div className="flex flex-col items-start gap-1">
      <div className="flex justify-start items-end gap-2 w-full">

        {/* Bot icon with optional spinning multicolor ring */}
        <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
          {isLoading && (
            <>
              {/* Multicolor conic-gradient spinning ring */}
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  background: "conic-gradient(from 0deg, #f43f5e, #f97316, #eab308, #22c55e, #3b82f6, #a855f7, #f43f5e)",
                  padding: "2px",
                  borderRadius: "9999px",
                }}
              >
                {/* Inner mask to make it a ring */}
                <div className="w-full h-full rounded-full bg-white" />
              </div>
            </>
          )}
          <div className="relative z-10 w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center bg-white">
            <BotMessageSquareIcon className="size-4 text-gray-500" />
          </div>
        </div>

        <div className="px-4 py-3 pb-1 select-text rounded-xl text-sm leading-relaxed max-w-[75%] bg-gray-100 text-gray-900 rounded-bl-xs">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              a: ({ href, children }) => (
                <a href={href} className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">
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
      </div>

      {!isLoading && (
        <div className="flex items-center gap-3 ml-12 mt-1 text-gray-500">
          <button onClick={handleCopy} className="flex items-center gap-1 text-xs hover:text-gray-800">
            <Copy className="size-4" />
            {copied ? "Copied" : ""}
          </button>
          <button onClick={() => setFavorite(!favorite)} className="flex items-center gap-1 text-xs hover:text-gray-800">
            <Star className={`size-4 ${favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
          </button>
          <button onClick={handleShare} className="flex items-center gap-1 text-xs hover:text-gray-800">
            <ExternalLink className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}