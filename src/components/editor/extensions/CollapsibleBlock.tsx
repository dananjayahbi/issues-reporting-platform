"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";

export const CollapsibleBlockExtension = Node.create({
  name: "collapsible",

  addOptions() {
    return {
      types: ["collapsible"],
    };
  },

  group: "block",

  content: "block+",

  defining: true,

  parseHTML() {
    return [
      {
        tag: "div[data-collapsible]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-collapsible": "" })];
  },

  addNodeView() {
    // Use ReactNodeViewRenderer with proper typing for Tiptap extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(CollapsibleBlockView as any);
  },
});

interface CollapsibleBlockViewProps {
  node: {
    attrs: {
      collapsed: boolean;
      title: string;
    };
  };
  updateAttributes: (attrs: { collapsed?: boolean; title?: string }) => void;
}

function CollapsibleBlockView({
  node,
  updateAttributes,
}: CollapsibleBlockViewProps) {
  const [collapsed, setCollapsed] = useState(node.attrs.collapsed ?? false);
  const title = node.attrs.title || "Collapsible section";

  const toggleCollapsed = () => {
    const newValue = !collapsed;
    setCollapsed(newValue);
    updateAttributes({ collapsed: newValue });
  };

  return (
    <NodeViewWrapper>
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg my-2 overflow-hidden">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="w-full flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
          <span className="font-medium text-slate-900 dark:text-white">
            {title}
          </span>
        </button>
        {!collapsed && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-700">
            <NodeViewContent className="prose prose-sm dark:prose-invert max-w-none" />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
