"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { FabricImage as _FabricImage, FabricObject as _FabricObject } from "fabric";
import * as fabric from "fabric";

export type EditorTool =
  | "select"
  | "pan"
  | "pen"
  | "line"
  | "arrow"
  | "rectangle"
  | "ellipse"
  | "text"
  | "highlight"
  | "blur"
  | "redact"
  | "crop"
  | "eraser";

interface _EditorState {
  tool: EditorTool;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  opacity: number;
  zoom: number;
}

interface HistoryEntry {
  canvasJson: string;
  timestamp: number;
}

export function useImageEditor() {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [tool, setTool] = useState<EditorTool>("select");
  const [strokeColor, setStrokeColor] = useState("#FF0000");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [opacity, setOpacity] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const initCanvas = useCallback((canvasElement: HTMLCanvasElement, initialImageUrl?: string) => {
    const canvas = new fabric.Canvas(canvasElement, {
      selection: true,
      preserveObjectStacking: true,
    });

    canvasRef.current = canvas;
    setIsReady(true);

    if (initialImageUrl) {
      // Type-safe callback wrapper for fabric.Image.fromURL
      const onImageLoad = (_img: unknown) => {
        canvas.renderAll();
        saveHistory();
      };
      try {
        (fabric.FabricImage.fromURL as unknown as (url: string, callback: (img: unknown) => void) => void)(
          initialImageUrl,
          onImageLoad
        );
      } catch (_e) {
        console.warn("Could not load image from URL");
        saveHistory();
      }
    } else {
      saveHistory();
    }

    return canvas;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveHistory = useCallback(() => {
    if (!canvasRef.current) return;

    const json = JSON.stringify(canvasRef.current.toJSON());
    const newEntry: HistoryEntry = { canvasJson: json, timestamp: Date.now() };

    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newEntry);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex, setHistory, setHistoryIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0 || !canvasRef.current) return;

    const prevEntry = history[historyIndex - 1];
    if (!prevEntry) return;
    canvasRef.current.loadFromJSON(prevEntry.canvasJson, () => {
      canvasRef.current?.renderAll();
      setHistoryIndex((prev) => prev - 1);
    });
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !canvasRef.current) return;

    const nextEntry = history[historyIndex + 1];
    if (!nextEntry) return;
    canvasRef.current.loadFromJSON(nextEntry.canvasJson, () => {
      canvasRef.current?.renderAll();
      setHistoryIndex((prev) => prev + 1);
    });
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const setToolAndActivate = useCallback(
    (newTool: EditorTool) => {
      setTool(newTool);
      if (!canvasRef.current) return;

      // Disable all modes first
      canvasRef.current.isDrawingMode = false;
      canvasRef.current.selection = true;

      switch (newTool) {
        case "pen":
          canvasRef.current.isDrawingMode = true;
          canvasRef.current.freeDrawingBrush = new fabric.PencilBrush(canvasRef.current);
          canvasRef.current.freeDrawingBrush.color = strokeColor;
          canvasRef.current.freeDrawingBrush.width = strokeWidth;
          break;
        case "select":
          canvasRef.current.selection = true;
          break;
        case "pan":
          canvasRef.current.selection = false;
          break;
      }
    },
    [strokeColor, strokeWidth]
  );

  const addShape = useCallback(
    (shapeType: "rectangle" | "ellipse" | "line" | "arrow") => {
      if (!canvasRef.current) return;

      let shape: fabric.Object;

      switch (shapeType) {
        case "rectangle":
          shape = new fabric.Rect({
            left: 100,
            top: 100,
            width: 100,
            height: 80,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
          });
          break;
        case "ellipse":
          shape = new fabric.Ellipse({
            left: 100,
            top: 100,
            rx: 50,
            ry: 30,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
          });
          break;
        case "line":
          shape = new fabric.Line([50, 50, 200, 50], {
            stroke: strokeColor,
            strokeWidth: strokeWidth,
          });
          break;
        case "arrow":
          // Simple arrow using line
          shape = new fabric.Line([50, 50, 200, 50], {
            stroke: strokeColor,
            strokeWidth: strokeWidth,
          });
          break;
        default:
          return;
      }

      canvasRef.current.add(shape);
      canvasRef.current.setActiveObject(shape);
      canvasRef.current.renderAll();
      saveHistory();
    },
    [fillColor, strokeColor, strokeWidth, saveHistory]
  );

  const addText = useCallback(
    (text: string) => {
      if (!canvasRef.current) return;

      const textObj = new fabric.IText(text, {
        left: 100,
        top: 100,
        fontSize: fontSize,
        fontFamily: fontFamily,
        fill: strokeColor,
        opacity: opacity,
      });

      canvasRef.current.add(textObj);
      canvasRef.current.setActiveObject(textObj);
      canvasRef.current.renderAll();
      saveHistory();
    },
    [fontSize, fontFamily, strokeColor, opacity, saveHistory]
  );

  const addHighlight = useCallback(
    (rect: { left: number; top: number; width: number; height: number }) => {
      if (!canvasRef.current) return;

      const highlight = new fabric.Rect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        fill: "rgba(255, 255, 0, 0.3)",
        stroke: "rgba(255, 255, 0, 0.5)",
        strokeWidth: 1,
      });

      canvasRef.current.add(highlight);
      canvasRef.current.renderAll();
      saveHistory();
    },
    [saveHistory]
  );

  const deleteSelected = useCallback(() => {
    if (!canvasRef.current) return;

    const active = canvasRef.current.getActiveObjects();
    if (active.length === 0) return;

    active.forEach((obj: fabric.Object) => canvasRef.current?.remove(obj));
    canvasRef.current.discardActiveObject();
    canvasRef.current.renderAll();
    saveHistory();
  }, [saveHistory]);

  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.clear();
    saveHistory();
  }, [saveHistory]);

  const exportImage = useCallback((format: "png" | "jpeg" = "png") => {
    if (!canvasRef.current) return null;

    return canvasRef.current.toDataURL({
      format,
      quality: 0.9,
      multiplier: 1 / zoom,
    });
  }, [zoom]);

  const zoomIn = useCallback(() => {
    if (!canvasRef.current) return;
    const newZoom = Math.min(zoom * 1.2, 5);
    setZoom(newZoom);
    canvasRef.current.setZoom(newZoom);
  }, [zoom]);

  const zoomOut = useCallback(() => {
    if (!canvasRef.current) return;
    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
    canvasRef.current.setZoom(newZoom);
  }, [zoom]);

  const resetZoom = useCallback(() => {
    if (!canvasRef.current) return;
    setZoom(1);
    canvasRef.current.setZoom(1);
  }, []);

  // Update brush settings when colors change
  useEffect(() => {
    if (canvasRef.current?.freeDrawingBrush) {
      canvasRef.current.freeDrawingBrush.color = strokeColor;
    }
  }, [strokeColor]);

  useEffect(() => {
    if (canvasRef.current?.freeDrawingBrush) {
      canvasRef.current.freeDrawingBrush.width = strokeWidth;
    }
  }, [strokeWidth]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
    };
  }, []);

  return {
    canvas: canvasRef.current,
    isReady,
    tool,
    setTool: setToolAndActivate,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor,
    strokeWidth,
    setStrokeWidth,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    opacity,
    setOpacity,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    initCanvas,
    saveHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    addShape,
    addText,
    addHighlight,
    deleteSelected,
    clearCanvas,
    exportImage,
  };
}
