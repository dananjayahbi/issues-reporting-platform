"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { FabricObject} from "fabric";
import { Canvas, Rect, Circle, Line, Textbox, PencilBrush, Image as FabricImage } from "fabric";
import { ImageEditorToolbar } from "./ImageEditorToolbar";
import { ToolOptionsPanel } from "./ToolOptionsPanel";
import { ZoomControls } from "./ZoomControls";
import { EditorHistoryBar } from "./EditorHistoryBar";
import { Button } from "@/components/ui/button";
import { cn as _cn } from "@/lib/utils/cn";
import { X, Save } from "lucide-react";

interface ImageEditorProps {
  imageUrl: string;
  onSave?: (dataUrl: string) => void;
  onClose?: () => void;
  initialAnnotations?: Annotation[];
}

interface Annotation {
  id: string;
  type: "rect" | "circle" | "arrow" | "text";
  data: Record<string, unknown>;
}

type Tool = "select" | "rect" | "circle" | "arrow" | "text" | "pencil" | "eraser";

export function ImageEditor({
  imageUrl,
  onSave,
  onClose,
  initialAnnotations: _initialAnnotations = [],
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [strokeColor, setStrokeColor] = useState("#ef4444");
  const [fillColor, setFillColor] = useState("#ef4444");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [tempObject, setTempObject] = useState<FabricObject | null>(null);

  // Define saveToHistory early so it can be used in useEffect
  const saveToHistory = useCallback(() => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), json]);
    setHistoryIndex((prev) => prev + 1);
  }, [canvas, historyIndex]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvasEl = canvasRef.current;

    const fabricCanvas = new Canvas(canvasEl, {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: "#ffffff",
    });

    // Load image
    const img = new (window as unknown as typeof Window & { Image: typeof Image }).Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const fabricImage = new FabricImage(img, {
        selectable: false,
        originX: "center",
        originY: "center",
      }) as FabricObject;

      // Scale image to fit canvas
      const scale = Math.min(
        (container.clientWidth * 0.9) / img.width,
        (container.clientHeight * 0.9) / img.height
      );
      const fabricImageObj = fabricImage as unknown as Record<string, unknown>;
      if (typeof fabricImageObj.scale === 'function') {
        fabricImageObj.scale(scale);
      }
      fabricCanvas.centerObject(fabricImage);
      fabricCanvas.add(fabricImage);
      if (typeof fabricImageObj.sendToBack === 'function') {
        fabricImageObj.sendToBack();
      }
      saveToHistory();
    };
    img.src = imageUrl;

    // Canvas event handlers
    fabricCanvas.on("mouse:down", (opt) => {
      if (activeTool === "select" || activeTool === "pencil") return;

      const pointer = fabricCanvas.getPointer(opt.e);
      setStartPoint({ x: pointer.x, y: pointer.y });
      setIsDrawing(true);

      if (activeTool === "rect") {
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          fill: "transparent",
          strokeUniform: true,
        });
        fabricCanvas.add(rect);
        setTempObject(rect);
      } else if (activeTool === "circle") {
        const circle = new Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          fill: "transparent",
          strokeUniform: true,
        });
        fabricCanvas.add(circle);
        setTempObject(circle);
      } else if (activeTool === "arrow") {
        const line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeUniform: true,
        });
        fabricCanvas.add(line);
        setTempObject(line);
      } else if (activeTool === "text") {
        const textbox = new Textbox("Text", {
          left: pointer.x,
          top: pointer.y,
          fontSize: 16,
          fill: strokeColor,
          fontFamily: "sans-serif",
        });
        fabricCanvas.add(textbox);
        fabricCanvas.setActiveObject(textbox);
        setIsDrawing(false);
        saveToHistory();
      }
    });

    fabricCanvas.on("mouse:move", (opt) => {
      if (!isDrawing || !startPoint || !tempObject) return;

      const pointer = fabricCanvas.getPointer(opt.e);

      if (activeTool === "rect" && tempObject instanceof Rect) {
        const width = pointer.x - startPoint.x;
        const height = pointer.y - startPoint.y;
        tempObject.set({
          width: Math.abs(width),
          height: Math.abs(height),
          left: width > 0 ? startPoint.x : pointer.x,
          top: height > 0 ? startPoint.y : pointer.y,
        });
      } else if (activeTool === "circle" && tempObject instanceof Circle) {
        const radius = Math.sqrt(
          Math.pow(pointer.x - startPoint.x, 2) + Math.pow(pointer.y - startPoint.y, 2)
        );
        tempObject.set({
          radius,
          left: startPoint.x,
          top: startPoint.y,
        });
      } else if (activeTool === "arrow" && tempObject instanceof Line) {
        tempObject.set({
          x2: pointer.x,
          y2: pointer.y,
        });
      }

      fabricCanvas.renderAll();
    });

    fabricCanvas.on("mouse:up", () => {
      if (isDrawing && tempObject) {
        fabricCanvas.setActiveObject(tempObject);
        saveToHistory();
      }
      setIsDrawing(false);
      setStartPoint(null);
      setTempObject(null);
    });

    // Pencil brush for free drawing
    if (activeTool === "pencil") {
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
      fabricCanvas.freeDrawingBrush.color = strokeColor;
      fabricCanvas.freeDrawingBrush.width = strokeWidth;
    } else {
      fabricCanvas.isDrawingMode = false;
    }

    setCanvas(fabricCanvas);

    // Handle resize
    const handleResize = () => {
      fabricCanvas.setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
      fabricCanvas.renderAll();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      fabricCanvas.dispose();
    };
  }, [activeTool, imageUrl, isDrawing, saveToHistory, startPoint, strokeColor, strokeWidth, tempObject]);

  // Update drawing mode when tool changes
  useEffect(() => {
    if (!canvas) return;

    if (activeTool === "pencil") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = strokeColor;
      canvas.freeDrawingBrush.width = strokeWidth;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [activeTool, canvas, strokeColor, strokeWidth]);

  // Update zoom
  useEffect(() => {
    if (!canvas) return;
    canvas.setZoom(zoom / 100);
    canvas.renderAll();
  }, [zoom, canvas]);

  const handleUndo = () => {
    if (historyIndex <= 0 || !canvas) return;
    const newIndex = historyIndex - 1;
    const historyState = history[newIndex];
    if (!historyState) return;
    canvas.loadFromJSON(JSON.parse(historyState)).then(() => {
      canvas.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || !canvas) return;
    const newIndex = historyIndex + 1;
    const historyState = history[newIndex];
    if (!historyState) return;
    canvas.loadFromJSON(JSON.parse(historyState)).then(() => {
      canvas.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const handleSave = () => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });
    onSave?.(dataUrl);
  };

  const handleDeleteSelected = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
    saveToHistory();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-medium">Image Editor</h3>
          <EditorHistoryBar
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <ImageEditorToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onDelete={handleDeleteSelected}
        />

        {/* Canvas Area */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden bg-slate-800">
          <canvas ref={canvasRef} />
          <ZoomControls zoom={zoom} onZoomChange={setZoom} />
        </div>

        {/* Options Panel */}
        <ToolOptionsPanel
          strokeColor={strokeColor}
          fillColor={fillColor}
          strokeWidth={strokeWidth}
          onStrokeColorChange={setStrokeColor}
          onFillColorChange={setFillColor}
          onStrokeWidthChange={setStrokeWidth}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 bg-slate-900 border-t border-slate-700">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
