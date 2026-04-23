"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
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
];

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(color);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value);
    }
  };

  const handleInputBlur = () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(inputValue)) {
      setInputValue(color);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 w-10 rounded-lg border-2 border-slate-600 hover:border-slate-500 transition-colors"
          style={{ backgroundColor: color }}
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="flex-1 h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm font-mono uppercase"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 w-64">
          <div className="grid grid-cols-6 gap-2 mb-3">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                onClick={() => {
                  onChange(presetColor);
                  setInputValue(presetColor);
                }}
                className={cn(
                  "h-8 w-8 rounded border-2 transition-transform hover:scale-110",
                  presetColor === color
                    ? "border-white"
                    : "border-transparent"
                )}
                style={{ backgroundColor: presetColor }}
              />
            ))}
          </div>
          <div className="pt-3 border-t border-slate-700">
            <label className="text-xs text-slate-400 mb-2 block">Custom Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => {
                onChange(e.target.value);
                setInputValue(e.target.value);
              }}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
