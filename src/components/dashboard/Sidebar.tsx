import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS, type FeatureKey, type SavedOutput } from "@/lib/storage-types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Bot,
  FileText,
  ListChecks,
  Mail,
  Menu,
  Microscope,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";
import { type ReactNode } from "react";

type Props = {
  active: FeatureKey;
  onSelect: (key: FeatureKey) => void;
  onOpenDisclaimer: () => void;
};

const FEATURES: { key: FeatureKey; label: string; icon: ReactNode }[] = [
  { key: "chat", label: "Chatbot", icon: <Bot className="h-4 w-4" /> },
  { key: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
  { key: "meetings", label: "Meetings", icon: <FileText className="h-4 w-4" /> },
  { key: "tasks", label: "Tasks", icon: <ListChecks className="h-4 w-4" /> },
  { key: "research", label: "Research", icon: <Microscope className="h-4 w-4" /> },
];

export function Sidebar(props: Props) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile trigger */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute left-3 top-3 z-10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-border bg-surface p-0">
            <SidebarContent {...props} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function SidebarContent({ active, onSelect, onOpenDisclaimer }: Props) {
  const [saved, setSaved] = useLocalStorage<SavedOutput[]>(STORAGE_KEYS.saved, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="rounded-lg border border-border-strong bg-surface-elevated p-1.5 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight tracking-tight">AI Workplace</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Productivity Suite
          </div>
        </div>
      </div>

      <nav className="space-y-0.5 px-2">
        {FEATURES.map((f) => {
          const isActive = active === f.key;
          return (
            <button
              key={f.key}
              onClick={() => onSelect(f.key)}
              className={`flex w-full items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "border-primary bg-surface-elevated text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-surface-elevated/60 hover:text-foreground"
              }`}
            >
              <span className={isActive ? "text-primary" : ""}>{f.icon}</span>
              {f.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 flex-1 overflow-hidden border-t border-border px-2 pt-3">
        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Saved outputs ({saved.length})
        </div>
        <div className="h-full space-y-1 overflow-y-auto pb-32 pr-1">
          {saved.length === 0 && (
            <div className="px-3 py-4 text-xs text-muted-foreground">
              Nothing saved yet. Use Save on any output to keep it here.
            </div>
          )}
          {saved.map((s) => (
            <div
              key={s.id}
              className="group flex items-start justify-between gap-2 rounded-md px-3 py-2 hover:bg-surface-elevated/60"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">{s.title}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.type} · {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => setSaved(saved.filter((x) => x.id !== s.id))}
                className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onOpenDisclaimer}
        className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground hover:bg-surface-elevated/60 hover:text-foreground"
      >
        <ShieldAlert className="h-3.5 w-3.5" />
        About AI Responsibility
      </button>
    </div>
  );
}
