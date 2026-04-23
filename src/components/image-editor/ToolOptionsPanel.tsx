"use client";

import { useState } from "react";
import { ColorPicker } from "./ColorPicker";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

interface ToolOptionsPanelProps {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  onStrokeColorChange: (color: string) => void;
  onFillColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
}

export function ToolOptionsPanel({
  strokeColor,
  fillColor,
  strokeWidth,
  onStrokeColorChange,
  onFillColorChange,
  onStrokeWidthChange,
}: ToolOptionsPanelProps) {
  const [activeTab, setActiveTab] = useState<"stroke" | "fill">("stroke");

  return (
    <div className="w-56 bg-slate-900 border-l border-slate-700 flex flex-col">
      <div className="p-3 border-b border-slate-700">
        <h3 className="text-sm font-medium text-white">Options</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab("stroke")}
          className={cn(
            "flex-1 px-3 py-2 text-sm transition-colors",
            activeTab === "stroke"
              ? "text-white border-b-2 border-primary"
              : "text-slate-400 hover:text-white"
          )}
        >
          Stroke
        </button>
        <button
          onClick={() => setActiveTab("fill")}
          className={cn(
            "flex-1 px-3 py-2 text-sm transition-colors",
            activeTab === "fill"
              ? "text-white border-b-2 border-primary"
              : "text-slate-400 hover:text-white"
          )}
        >
          Fill
        </button>
      </div>

      <div className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Color Picker */}
        <div className="space-y-2">
          <Label className="text-sm text-slate-300">
            {activeTab === "stroke" ? "Stroke Color" : "Fill Color"}
          </Label>
          <ColorPicker
            color={activeTab === "stroke" ? strokeColor : fillColor}
            onChange={activeTab === "stroke" ? onStrokeColorChange : onFillColorChange}
          />
        </div>

        {/* Stroke Width */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-slate-300">Stroke Width</Label>
            <span className="text-sm text-slate-400">{strokeWidth}px</span>
          </div>
          <Slider
            value={[strokeWidth]}
            onValueChange={([v]) => v !== undefined && onStrokeWidthChange(v)}
            min={1}
            max={20}
            step={1}
            className="py-2"
          />
        </div>

        {/* Preset Colors */}
        <div className="space-y-2">
          <Label className="text-sm text-slate-300">Preset Colors</Label>
          <div className="grid grid-cols-6 gap-2">
            {[
              "#ef4444",
              "#f97316",
              "#eab308",
              "#22c55e",
              "#3b82f6",
              "#8b5cf6",
              "#ec4899",
              "#ffffff",
              "#000000",
              "#6b7280",
              "#1e293b",
              "#0f172a",
            ].map((color) => (
              <button
                key={color}
                onClick={() => onStrokeColorChange(color)}
                className="h-8 w-8 rounded border border-slate-600 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
