"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus, Maximize2 } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function ZoomControls({ zoom, onZoomChange }: ZoomControlsProps) {
  const handleZoomIn = () => onZoomChange(Math.min(zoom + 25, 400));
  const handleZoomOut = () => onZoomChange(Math.max(zoom - 25, 25));
  const handleFit = () => onZoomChange(100);

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-slate-800/90 rounded-lg p-1 border border-slate-700">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white hover:bg-slate-700"
        onClick={handleZoomOut}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-14 text-center text-sm text-white font-medium">
        {zoom}%
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white hover:bg-slate-700"
        onClick={handleZoomIn}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-slate-700" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white hover:bg-slate-700"
        onClick={handleFit}
        title="Fit to view"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
