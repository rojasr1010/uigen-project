"use client";

import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolInvocation: {
    toolName: string;
    args: Record<string, unknown>;
    state: string;
    result?: unknown;
  };
}

function getFilename(path: unknown): string {
  if (typeof path !== "string" || !path) return "";
  return path.split("/").pop() ?? path;
}

function getLabel(toolName: string, args: Record<string, unknown>): string {
  const command = args.command as string | undefined;
  const filename = getFilename(args.path);

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return `Creating ${filename}`;
      case "str_replace":
      case "insert":
        return `Editing ${filename}`;
      case "undo_edit":
        return `Undoing edit on ${filename}`;
      case "view":
        return `Reading ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename": {
        const newFilename = getFilename(args.new_path);
        return `Renaming ${filename} → ${newFilename}`;
      }
      case "delete":
        return `Deleting ${filename}`;
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state, result } = toolInvocation;
  const label = getLabel(toolName, args);
  const isDone = state === "result" && result != null;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
