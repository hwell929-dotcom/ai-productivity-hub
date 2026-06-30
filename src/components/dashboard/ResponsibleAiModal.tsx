import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldAlert, CheckCircle2, AlertTriangle, BookOpen } from "lucide-react";
import { useState } from "react";

type Props = {
  open: boolean;
  onAcknowledge: (dontShowAgain: boolean) => void;
};

export function ResponsibleAiModal({ open, onAcknowledge }: Props) {
  const [dontShow, setDontShow] = useState(true);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl border-border-strong bg-surface">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldAlert className="h-5 w-5 text-primary" />
            About AI Responsibility
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2 text-sm">
          <Section
            icon={<CheckCircle2 className="h-4 w-4 text-[oklch(0.72_0.17_160)]" />}
            title="What AI can do well"
            items={[
              "Generate drafts and suggestions quickly",
              "Summarize long text into structured points",
              "Brainstorm variations (tone, framing)",
              "Help surface key information",
            ]}
          />
          <Section
            icon={<AlertTriangle className="h-4 w-4 text-[oklch(0.78_0.16_70)]" />}
            title="Where AI struggles"
            items={[
              "Guaranteeing factual accuracy",
              "Replacing your judgment",
              "Understanding context beyond what you provide",
              "Legal, medical, or financial decisions",
            ]}
          />
          <Section
            icon={<ShieldAlert className="h-4 w-4 text-destructive" />}
            title="Known risks"
            items={[
              "Hallucination — fabricated details that sound confident",
              "Bias inherited from training data",
              "Statistics and citations may be invented",
              "Tone may miss subtle context",
            ]}
          />
          <Section
            icon={<BookOpen className="h-4 w-4 text-primary" />}
            title="Best practices"
            items={[
              "Treat output as a first draft, never the final word",
              "Verify any statistic against the source",
              "Review emails for tone before sending",
              "Click 'View system prompt' to see how AI was instructed",
            ]}
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={dontShow}
              onCheckedChange={(v) => setDontShow(v === true)}
            />
            Don't show this again
          </label>
          <Button onClick={() => onAcknowledge(dontShow)}>I understand, proceed</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated/60 p-3">
      <div className="mb-2 flex items-center gap-2 font-medium">
        {icon}
        {title}
      </div>
      <ul className="space-y-1 pl-6 text-muted-foreground">
        {items.map((i) => (
          <li key={i} className="list-disc">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
