import { Button } from "@/components/ui/button";
import { STORAGE_KEYS, type FeatureKey, type SavedOutput } from "@/lib/storage-types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Copy, Save, Pencil, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SystemPromptViewer } from "./SystemPromptViewer";

type Props = {
  title: string;
  content: string;
  type: FeatureKey;
  systemPrompt?: string;
  headerRight?: React.ReactNode;
  monospace?: boolean;
};

export function OutputCard({
  title,
  content,
  type,
  systemPrompt,
  headerRight,
  monospace,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(content);
  const [saved, setSavedItems] = useLocalStorage<SavedOutput[]>(STORAGE_KEYS.saved, []);

  // Sync if parent regenerates
  if (!editing && text !== content) {
    setText(content);
  }

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const save = () => {
    const item: SavedOutput = {
      id: `out_${Date.now()}`,
      type,
      title,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setSavedItems([item, ...saved]);
    toast.success("Saved", { description: title });
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {headerRight}
      </div>

      {editing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`min-h-[200px] flex-1 resize-none rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-border-strong ${
            monospace ? "font-mono text-xs" : ""
          }`}
        />
      ) : (
        <pre
          className={`flex-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 ${
            monospace ? "font-mono text-xs" : "font-sans"
          }`}
        >
          {text}
        </pre>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => setEditing((e) => !e)}>
          {editing ? <Check className="mr-1 h-3.5 w-3.5" /> : <Pencil className="mr-1 h-3.5 w-3.5" />}
          {editing ? "Done" : "Edit"}
        </Button>
        <Button size="sm" variant="ghost" onClick={copy}>
          <Copy className="mr-1 h-3.5 w-3.5" /> Copy
        </Button>
        <Button size="sm" variant="ghost" onClick={save}>
          <Save className="mr-1 h-3.5 w-3.5" /> Save
        </Button>
      </div>

      {systemPrompt && <SystemPromptViewer prompt={systemPrompt} />}
    </div>
  );
}
