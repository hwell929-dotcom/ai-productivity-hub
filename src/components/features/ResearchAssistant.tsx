import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { analyzeResearch } from "@/lib/ai.functions";
import { LoadingShimmer } from "@/components/dashboard/LoadingShimmer";
import { SystemPromptViewer } from "@/components/dashboard/SystemPromptViewer";
import { Header } from "./EmailGenerator";
import { Microscope, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Research = {
  source_title: string;
  reading_time: string;
  executive_summary: string;
  key_insights: { insight: string; impact: string; confidence: "High" | "Medium" | "Low" }[];
  key_statistics: string[];
  recommendations: string[];
  questions_raised: string[];
  related_topics: string[];
};

const CONFIDENCE = {
  High: "border-[oklch(0.72_0.17_160/0.5)] text-[oklch(0.78_0.17_160)]",
  Medium: "border-[oklch(0.78_0.16_70/0.5)] text-[oklch(0.82_0.16_70)]",
  Low: "border-destructive/50 text-destructive",
};

export function ResearchAssistant() {
  const [content, setContent] = useState("");
  const [angle, setAngle] = useState<"insights" | "summary" | "recommendations" | "simplified">(
    "insights",
  );
  const [loading, setLoading] = useState(false);
  const [research, setResearch] = useState<Research | null>(null);
  const [prompt, setPrompt] = useState("");

  const handle = async () => {
    if (content.trim().length < 100) {
      toast.error("Paste at least 100 characters to analyze");
      return;
    }
    setLoading(true);
    setResearch(null);
    try {
      const res = await analyzeResearch({ data: { content, angle } });
      setResearch(res.research as Research);
      setPrompt(res.systemPrompt);
    } catch (e) {
      toast.error("Analysis failed", {
        description: e instanceof Error ? e.message : "Try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <Header
        title="AI Research Assistant"
        subtitle="Paste an article or notes. Get a structured summary with insights and confidence ratings."
        icon={<Microscope className="h-5 w-5" />}
      />

      <div className="rounded-xl border border-border bg-surface p-5">
        <Label htmlFor="research">Content to analyze</Label>
        <Textarea
          id="research"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste an article, transcript, or research notes..."
          className="mt-2 min-h-[180px] resize-none border-border bg-background text-sm"
          maxLength={20000}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
          <Select value={angle} onValueChange={(v) => setAngle(v as typeof angle)}>
            <SelectTrigger className="border-border bg-background">
              <SelectValue placeholder="Research angle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="insights">Key insights</SelectItem>
              <SelectItem value="summary">Executive summary</SelectItem>
              <SelectItem value="recommendations">Recommendations</SelectItem>
              <SelectItem value="simplified">Simplified (ELI5)</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handle}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          ⚠ Verify statistics against original sources. AI may misattribute.
        </p>
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <LoadingShimmer lines={8} />
        </div>
      )}

      {research && (
        <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{research.source_title}</h2>
            <p className="text-xs text-muted-foreground">{research.reading_time}</p>
          </div>

          <div className="rounded-lg border-l-2 border-primary bg-surface-elevated/60 p-3 text-sm">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Executive Summary
            </div>
            {research.executive_summary}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Key insights</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {research.key_insights.map((k, i) => (
                <div key={i} className="rounded-lg border border-border bg-surface-elevated/60 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{k.insight}</p>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${CONFIDENCE[k.confidence]}`}
                    >
                      {k.confidence}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{k.impact}</p>
                </div>
              ))}
            </div>
          </div>

          {research.key_statistics.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Statistics</h3>
              <ul className="space-y-1 pl-5 text-sm text-foreground/90">
                {research.key_statistics.map((s) => (
                  <li key={s} className="list-disc">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {research.recommendations.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Recommendations</h3>
              <ol className="space-y-1 pl-5 text-sm text-foreground/90">
                {research.recommendations.map((r) => (
                  <li key={r} className="list-decimal">
                    {r}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {research.questions_raised.length > 0 && (
            <details className="rounded-lg border border-border bg-surface-elevated/40 p-3 text-sm">
              <summary className="cursor-pointer text-sm font-medium">
                Follow-up questions ({research.questions_raised.length})
              </summary>
              <ul className="mt-2 space-y-1 pl-5 text-muted-foreground">
                {research.questions_raised.map((q) => (
                  <li key={q} className="list-disc">
                    {q}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {research.related_topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {research.related_topics.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-surface-elevated px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <SystemPromptViewer prompt={prompt} />
        </div>
      )}
    </div>
  );
}
