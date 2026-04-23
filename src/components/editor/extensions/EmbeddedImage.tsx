"use client";

import { useState } from "react";
import { X, ZoomOut, ZoomIn, Maximize2 } from "lucide-react";
import Image from "next/image";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";

export const EmbeddedImageExtension = Node.create({
  name: "embeddedImage",

  addOptions() {
    return {
      types: ["embeddedImage"],
    };
  },

  group: "block",

  atom: true,

  parseHTML() {
    return [
      {
        tag: "div[data-embedded-image]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-embedded-image": "" })];
  },

  addNodeView() {
    // Use ReactNodeViewRenderer with proper typing for Tiptap extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(EmbeddedImageView as any);
  },
});

interface EmbeddedImageViewProps {
  node: {
    attrs: {
      src: string;
      alt?: string;
      title?: string;
      width?: number;
      height?: number;
    };
  };
  updateAttributes: (attrs: {
    src?: string;
    alt?: string;
    title?: string;
    width?: number;
    height?: number;
  }) => void;
  deleteNode: () => void;
}

function EmbeddedImageView({ node }: EmbeddedImageViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const { src, alt, title } = node.attrs;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 25));
  const handleFit = () => setZoom(100);

  if (isFullscreen) {
    return (
      <NodeViewWrapper>
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative max-w-5xl max-h-[90vh]">
            <Image
              src={src}
              alt={alt || ""}
              fill
              className="max-w-full max-h-[90vh] object-contain"
              style={{ objectFit: "contain" }}
            />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <div className="group relative inline-block my-2">
        <Image
          src={src}
          alt={alt || ""}
          title={title || alt || ""}
          fill
          className="max-w-full rounded-lg"
          style={{
            width: zoom !== 100 ? "auto" : "100%",
            height: zoom !== 100 ? "auto" : "auto",
            objectFit: "contain",
          }}
        />
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/70 rounded-lg p-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded text-white hover:bg-white/20 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="px-2 text-white text-sm min-w-[3rem] text-center">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded text-white hover:bg-white/20 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleFit}
            className="p-1.5 rounded text-white hover:bg-white/20 transition-colors"
            title="Fit"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded text-white hover:bg-white/20 transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
