"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { EditorToolbar } from "./EditorToolbar";
import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";

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
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className="prose prose-slate dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
}
