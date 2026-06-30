import { ChevronDown, Code2 } from "lucide-react";
import { useState } from "react";

export function SystemPromptViewer({ prompt }: { prompt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-lg border border-border bg-surface-elevated/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <span className="flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5" />
          View system prompt
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <pre className="overflow-x-auto border-t border-border p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          {prompt}
        </pre>
      )}
    </div>
  );
}
