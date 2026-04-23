"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ExternalLink, Link2, X } from "lucide-react";

interface LinkPreviewProps {
  url: string;
  onRemove?: () => void;
}

interface PreviewData {
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
}

export function LinkPreview({ url, onRemove }: LinkPreviewProps) {
  const [_loading, _setLoading] = useState(false);
  const [_preview, _setPreview] = useState<PreviewData | null>(null);
  const [_expanded, _setExpanded] = useState(false);

  // Extract domain from URL
  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-hidden transition-all",
        _expanded ? "w-full" : "w-80"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 min-w-0">
          <Link2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span className="text-xs text-slate-500 truncate">{domain}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-slate-400" />
          </a>
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-3">
        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
          {url}
        </p>
        {_preview?.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {_preview.description}
          </p>
        )}
      </div>
    </div>
  );
}
