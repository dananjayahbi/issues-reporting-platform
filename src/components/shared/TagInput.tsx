"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TagInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxTags?: number;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Add tag...",
  disabled = false,
  className,
  maxTags = 10,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !value.includes(trimmedValue) && value.length < maxTags) {
      onChange?.([...value, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 p-2 rounded-md border bg-background min-h-[42px] focus-within:ring-2 focus-within:ring-ring",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {value.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-sm"
        >
          {tag}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => removeTag(index)}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </span>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={disabled}
      />
    </div>
  );
}
