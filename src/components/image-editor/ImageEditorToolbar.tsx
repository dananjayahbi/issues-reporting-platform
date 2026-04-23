"use client";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  MousePointer2,
  Square,
  Circle,
  ArrowRight,
  Type,
  Pencil,
  Eraser,
  Trash2,
} from "lucide-react";

type Tool = "select" | "rect" | "circle" | "arrow" | "text" | "pencil" | "eraser";

interface ImageEditorToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onDelete: () => void;
}

const tools: { value: Tool; icon: typeof MousePointer2; label: string }[] = [
  { value: "select", icon: MousePointer2, label: "Select" },
  { value: "rect", icon: Square, label: "Rectangle" },
  { value: "circle", icon: Circle, label: "Circle" },
  { value: "arrow", icon: ArrowRight, label: "Arrow" },
  { value: "text", icon: Type, label: "Text" },
  { value: "pencil", icon: Pencil, label: "Pencil" },
  { value: "eraser", icon: Eraser, label: "Eraser" },
];

export function ImageEditorToolbar({
  activeTool,
  onToolChange,
  onDelete,
}: ImageEditorToolbarProps) {
  return (
    <div className="w-14 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-4 gap-1">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Button
            key={tool.value}
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10",
              activeTool === tool.value
                ? "bg-primary text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            onClick={() => onToolChange(tool.value)}
            title={tool.label}
          >
            <Icon className="h-5 w-5" />
          </Button>
        );
      })}

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 text-red-400 hover:text-red-300 hover:bg-red-900/20"
        onClick={onDelete}
        title="Delete selected"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
