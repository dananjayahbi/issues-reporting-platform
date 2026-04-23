"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils/cn";

interface EditorWordCountProps {
  editor: Editor | null;
  className?: string;
}

export function EditorWordCount({ editor, className }: EditorWordCountProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [charCountNoSpaces, setCharCountNoSpaces] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const updateCounts = () => {
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
      setCharCount(editor.storage.characterCount?.characters() ?? text.length);
      setCharCountNoSpaces(
        editor.storage.characterCount?.charactersNoSpaces() ?? text.replace(/\s/g, "").length
      );
    };

    updateCounts();
    editor.on("update", updateCounts);

    return () => {
      editor.off("update", updateCounts);
    };
  }, [editor]);

  return (
    <div className={cn("flex items-center gap-4 text-sm text-slate-500", className)}>
      <span>
        {wordCount} word{wordCount !== 1 ? "s" : ""}
      </span>
      <span>
        {charCount} character{charCount !== 1 ? "s" : ""}
      </span>
      <span className="hidden sm:inline">
        {charCountNoSpaces} character{charCountNoSpaces !== 1 ? "s" : ""} (no spaces)
      </span>
    </div>
  );
}
