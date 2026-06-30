import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeMeeting } from "@/lib/ai.functions";
import { LoadingShimmer } from "@/components/dashboard/LoadingShimmer";
import { SystemPromptViewer } from "@/components/dashboard/SystemPromptViewer";
import { Header } from "./EmailGenerator";
import { FileText, Sparkles, Calendar, CheckSquare, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Summary = {
  title: string;
  date: string | null;
  attendees: string[];
  key_points: string[];
  decisions: string[];
  action_items: { task: string; owner: string | null; deadline: string | null }[];
  deadlines: string[];
  next_meeting: string | null;
};

export function MeetingNotes() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [prompt, setPrompt] = useState<string>("");

  const handle = async () => {
    if (notes.trim().length < 50) {
      toast.error("Paste at least 50 characters of notes");
      return;
    }
    setLoading(true);
    setSummary(null);
    try {
      const res = await summarizeMeeting({ data: { notes } });
      setSummary(res.summary as Summary);
      setPrompt(res.systemPrompt);
    } catch (e) {
      toast.error("Summarization failed", {
        description: e instanceof Error ? e.message : "Try clearer formatting",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <Header
        title="Meeting Notes Summarizer"
        subtitle="Paste raw notes. Get structured key points, decisions, and action items."
        icon={<FileText className="h-5 w-5" />}
      />

      <div className="rounded-xl border border-border bg-surface p-5">
        <Label htmlFor="notes">Raw meeting notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste meeting notes here..."
          className="mt-2 min-h-[200px] resize-none border-border bg-background font-mono text-xs"
          maxLength={20000}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{notes.length} / 20000</span>
          <Button
            onClick={handle}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Summarizing..." : "Summarize"}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <LoadingShimmer lines={6} />
        </div>
      )}

      {summary && (
        <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight">{summary.title}</h2>
            {summary.date && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-elevated px-2.5 py-0.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> {summary.date}
              </span>
            )}
          </div>

          {summary.attendees.length > 0 && (
            <div>
              <SectionTitle icon={<Users className="h-4 w-4" />}>Attendees</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {summary.attendees.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-border bg-surface-elevated px-2.5 py-0.5 text-xs"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Block title="Key points" items={summary.key_points} />

          {summary.decisions.length > 0 && (
            <div className="rounded-lg border-l-2 border-primary bg-surface-elevated/60 p-3">
              <SectionTitle>Decisions</SectionTitle>
              <ul className="space-y-1 pl-5 text-sm text-foreground/90">
                {summary.decisions.map((d) => (
                  <li key={d} className="list-disc">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.action_items.length > 0 && (
            <div>
              <SectionTitle icon={<CheckSquare className="h-4 w-4" />}>
                Action items
              </SectionTitle>
              <div className="grid gap-2 md:grid-cols-2">
                {summary.action_items.map((a, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-surface-elevated/60 p-3 text-sm"
                  >
                    <div className="font-medium">{a.task}</div>
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                      {a.owner && <span>👤 {a.owner}</span>}
                      {a.deadline && <span>📅 {a.deadline}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.next_meeting && (
            <div className="text-sm text-muted-foreground">
              <span className="text-foreground">Next meeting:</span> {summary.next_meeting}
            </div>
          )}

          <SystemPromptViewer prompt={prompt} />
        </div>
      )}
    </div>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
      {icon}
      {children}
    </h3>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <ul className="space-y-1 pl-5 text-sm text-foreground/90">
        {items.map((i) => (
          <li key={i} className="list-disc">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
