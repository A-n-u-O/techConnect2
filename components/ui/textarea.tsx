import { cn } from "@/lib/utils";
import React from "react";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  variant?: "default" | "filled" | "outline";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "resize-none",
          variant === "default" && "border border-input bg-transparent",
          variant === "filled" && "border border-input bg-muted",
          variant === "outline" && "border-2 border-border bg-transparent",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

export {Textarea}