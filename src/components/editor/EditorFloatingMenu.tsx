"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Table,
  Minus,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditorFloatingMenuProps {
  editor: Editor | null;
}

// Note: This component is defined but not currently used in the UI
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FloatingMenu({ editor }: EditorFloatingMenuProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  const handleAddLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().toggleMark('link', { href: linkUrl }).run() as unknown;
      setLinkUrl("");
      setShowLinkInput(false);
    }
  };

  if (!editor) return null;

  const tools = [
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { toggleHeading: (opts: { level: number }) => { run: () => void } };
          chain.toggleHeading({ level: 1 }).run();
        } catch (_e) {
          console.warn("toggleHeading not available");
        }
      },
      isActive: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { toggleHeading: (opts: { level: number }) => { run: () => void } };
          chain.toggleHeading({ level: 2 }).run();
        } catch (_e) {
          console.warn("toggleHeading not available");
        }
      },
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { toggleHeading: (opts: { level: number }) => { run: () => void } };
          chain.toggleHeading({ level: 3 }).run();
        } catch (_e) {
          console.warn("toggleHeading not available");
        }
      },
      isActive: editor.isActive("heading", { level: 3 }),
    },
    { type: "divider" },
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
      icon: CheckSquare,
      label: "Task List",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { toggleTaskList: () => { run: () => void } };
          chain.toggleTaskList().run();
        } catch (_e) {
          console.warn("toggleTaskList not available");
        }
      },
      isActive: editor.isActive("taskList"),
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
      icon: Link,
      label: "Link",
      action: () => setShowLinkInput(!showLinkInput),
      isActive: editor.isActive("link"),
    },
    {
      icon: Image,
      label: "Image",
      action: () => {
        const url = window.prompt("Enter image URL:");
        if (url) {
          try {
            const chain = editor.chain().focus() as unknown as { setImage: (opts: { src: string }) => { run: () => void } };
            chain.setImage({ src: url }).run();
          } catch (_e) {
            console.warn("setImage not available");
          }
        }
      },
      isActive: false,
    },
    {
      icon: Table,
      label: "Table",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { insertTable: (opts: { rows: number; cols: number }) => { run: () => void } };
          chain.insertTable({ rows: 3, cols: 3 }).run();
        } catch (_e) {
          console.warn("insertTable not available");
        }
      },
      isActive: false,
    },
    {
      icon: Minus,
      label: "Divider",
      action: () => {
        try {
          const chain = editor.chain().focus() as unknown as { setHorizontalRule: () => { run: () => void } };
          chain.setHorizontalRule().run();
        } catch (_e) {
          console.warn("setHorizontalRule not available");
        }
      },
      isActive: false,
    },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
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
            className={cn(
              "h-8 w-8 p-0",
              tool.isActive && "bg-primary/10 text-primary"
            )}
            onClick={tool.action}
            title={tool.label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
      {showLinkInput && (
        <div className="flex items-center gap-1 ml-1">
          <Input
            placeholder="URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
            className="h-8 w-40 text-sm"
          />
          <Button size="sm" onClick={handleAddLink}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}

interface RichTextEditorProps {
  content: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder: _placeholder,
  editable = true,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          "border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden animate-pulse",
          className
        )}
      >
        <div className="h-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700" />
        <div className="p-4 space-y-2">
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800",
        className
      )}
    >
      <EditorContent
        editor={editor}
        className="prose prose-slate dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
}
