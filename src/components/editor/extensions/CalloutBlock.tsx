"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { cn } from "@/lib/utils/cn";
import { AlertCircle, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { NodeViewContent } from "@tiptap/react";

export const CalloutBlockExtension = Node.create({
  name: "callout",

  addOptions() {
    return {
      types: ["callout"],
    };
  },

  group: "block",

  content: "block+",

  parseHTML() {
    return [
      {
        tag: "div[data-callout]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-callout": "" })];
  },

  addNodeView() {
    // Use ReactNodeViewRenderer with proper typing for Tiptap extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(CalloutBlockView as any);
  },
});

type CalloutType = "info" | "warning" | "error" | "success";

interface CalloutBlockViewProps {
  node: {
    attrs: {
      calloutType: CalloutType;
    };
  };
  updateAttributes: (attrs: { calloutType?: CalloutType }) => void;
}

function CalloutBlockView({ node, updateAttributes: _updateAttributes }: CalloutBlockViewProps) {
  const calloutType = node.attrs.calloutType || "info";

  const config: Record<
    CalloutType,
    { icon: typeof Info; bg: string; border: string; iconColor: string }
  > = {
    info: {
      icon: Info,
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-600",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-800",
      iconColor: "text-yellow-600",
    },
    error: {
      icon: AlertCircle,
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      iconColor: "text-red-600",
    },
    success: {
      icon: CheckCircle,
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      iconColor: "text-green-600",
    },
  };

  const { icon: Icon, bg, border, iconColor } = config[calloutType];

  return (
    <NodeViewWrapper>
      <div
        className={cn(
          "flex gap-3 p-4 rounded-lg border my-2",
          bg,
          border
        )}
      >
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <NodeViewContent className="prose prose-sm dark:prose-invert max-w-none" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
