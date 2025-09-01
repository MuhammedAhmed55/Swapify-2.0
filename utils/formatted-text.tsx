"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import "highlight.js/styles/github.css";

interface FormattedTextProps {
  content: string;
  className?: string;
}

export const FormattedText = memo(
  ({ content, className }: FormattedTextProps) => {
    return (
      <div className={cn("prose prose-slate max-w-none", className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          components={{
            // Custom heading styles
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold  mb-4 pb-2 border-b border-slate-200">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold  mb-3 mt-6">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold  mb-2 mt-4">{children}</h3>
            ),

            // Enhanced paragraph styling
            p: ({ children }) => (
              <p className=" leading-relaxed mb-2 text-[15px]">{children}</p>
            ),

            // Custom list styling
            ul: ({ children }) => (
              <ul className="space-y-2 mb-4 ml-4">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="space-y-2 mb-4 ml-4">{children}</ol>
            ),
            li: ({ children }) => (
              <li className=" leading-relaxed">{children}</li>
            ),

            // Enhanced blockquote
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 rounded-r-lg">
                <div className=" italic">{children}</div>
              </blockquote>
            ),

            // Code styling
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");

              // if (inline) {
              //   return (
              //     <code className="bg-slate-100  px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
              //   )
              // }

              return (
                <div className="my-4">
                  {match && (
                    <div className="bg-slate-800 text-slate-200 px-3 py-1 text-xs font-medium rounded-t-lg">
                      {match[1]}
                    </div>
                  )}
                  <pre
                    className={cn(
                      "bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto max-w-[calc(100vw-622px)]",
                      match ? "rounded-t-none" : ""
                    )}
                  >
                    <code
                      className={className}
                      {...props}
                      style={{
                        maxWidth: "calc(100vw - 622px)",
                        width: "calc(100vw - 622px)",
                      }}
                    >
                      {children}
                    </code>
                  </pre>
                </div>
              );
            },

            // Enhanced table styling
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-slate-200 rounded-lg">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-50">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="border border-slate-200 px-4 py-2 text-left font-semibold ">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-slate-200 px-4 py-2 ">{children}</td>
            ),

            // Enhanced link styling
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),

            // Image styling
            img: ({ src, alt }) => (
              <div className="my-4">
                <img
                  src={src || "/placeholder.svg"}
                  alt={alt}
                  className="max-w-full h-auto rounded-lg shadow-sm border border-slate-200"
                />
                {alt && (
                  <p className="text-sm text-slate-500 text-center mt-2 italic">
                    {alt}
                  </p>
                )}
              </div>
            ),

            // Horizontal rule
            hr: () => <hr className="my-6 border-slate-300" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);

FormattedText.displayName = "FormattedText";
