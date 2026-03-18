"use client";

import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  sender: "bot" | "user";
  children: React.ReactNode;
  animate?: boolean;
}

export function ChatBubble({ sender, children, animate = true }: ChatBubbleProps) {
  const isBot = sender === "bot";
  return (
    <div
      className={cn(
        "flex gap-2 max-w-[85%]",
        isBot ? "self-start" : "self-end flex-row-reverse",
        animate && "animate-bubble-in"
      )}
    >
      {isBot && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-bold mt-0.5">
          DS
        </div>
      )}
      <div
        className={cn(
          "px-3.5 py-2.5 text-[13px]",
          isBot
            ? "bg-card border rounded-xl rounded-bl-sm text-card-foreground"
            : "bg-primary text-primary-foreground rounded-xl rounded-br-sm"
        )}
      >
        {children}
      </div>
    </div>
  );
}
