"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { EditorToolbar } from "./EditorToolbar";
import { useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder: _placeholder,
  editable = true,
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

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className="prose prose-slate dark:prose-invert max-w-none p-4 min-h-[200px]"
      />
    </div>
  );
}
