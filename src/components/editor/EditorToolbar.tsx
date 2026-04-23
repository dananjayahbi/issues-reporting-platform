"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const tools = [
    {
      icon: Bold,
      label: "Bold",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { toggleBold: () => { run: () => void } };
          chain.toggleBold().run();
        } catch (_e) {
          console.warn("toggleBold not available");
        }
      },
      isActive: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { toggleItalic: () => { run: () => void } };
          chain.toggleItalic().run();
        } catch (_e) {
          console.warn("toggleItalic not available");
        }
      },
      isActive: editor.isActive("italic"),
    },
    {
      icon: Strikethrough,
      label: "Strikethrough",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { toggleStrike: () => { run: () => void } };
          chain.toggleStrike().run();
        } catch (_e) {
          console.warn("toggleStrike not available");
        }
      },
      isActive: editor.isActive("strike"),
    },
    {
      icon: Code,
      label: "Code",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { toggleCode: () => { run: () => void } };
          chain.toggleCode().run();
        } catch (_e) {
          console.warn("toggleCode not available");
        }
      },
      isActive: editor.isActive("code"),
    },
    { type: "divider" },
    {
      icon: List,
      label: "Bullet List",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { toggleBulletList: () => { run: () => void } };
          chain.toggleBulletList().run();
        } catch (_e) {
          console.warn("toggleBulletList not available");
        }
      },
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { toggleOrderedList: () => { run: () => void } };
          chain.toggleOrderedList().run();
        } catch (_e) {
          console.warn("toggleOrderedList not available");
        }
      },
      isActive: editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { toggleBlockquote: () => { run: () => void } };
          chain.toggleBlockquote().run();
        } catch (_e) {
          console.warn("toggleBlockquote not available");
        }
      },
      isActive: editor.isActive("blockquote"),
    },
    { type: "divider" },
    {
      icon: Undo,
      label: "Undo",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { undo: () => { run: () => void } };
          chain.undo().run();
        } catch (_e) {
          console.warn("undo not available");
        }
      },
      isActive: false,
    },
    {
      icon: Redo,
      label: "Redo",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { redo: () => { run: () => void } };
          chain.redo().run();
        } catch (_e) {
          console.warn("redo not available");
        }
      },
      isActive: false,
    },
  ];

  return (
    <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      {tools.map((tool, index) => {
        if (tool.type === "divider") {
          return (
            <div
              key={`divider-${index}`}
              className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"
            />
          );
        }

        const Icon = tool.icon as unknown as React.ComponentType<{ className: string }>;
        return (
          <Button
            key={tool.label}
            type="button"
            variant="ghost"
            size="sm"
            onClick={tool.action}
            className={cn(
              "h-8 w-8 p-0",
              tool.isActive && "bg-slate-200 dark:bg-slate-700"
            )}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
}
