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
import { planTasks } from "@/lib/ai.functions";
import { LoadingShimmer } from "@/components/dashboard/LoadingShimmer";
import { SystemPromptViewer } from "@/components/dashboard/SystemPromptViewer";
import { Header } from "./EmailGenerator";
import { ListChecks, Sparkles, Clock, Lightbulb } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Plan = {
  plan_title: string;
  timeframe: string;
  total_estimated_hours: number;
  tasks: {
    priority: number;
    task: string;
    estimated_time: string;
    urgency: "high" | "medium" | "low";
    time_slot: string;
    tips: string;
  }[];
  optimization_insights: string[];
  buffer_time: string;
};

const URGENCY_STYLES = {
  high: "border-destructive/60 bg-destructive/5",
  medium: "border-[oklch(0.78_0.16_70/0.5)] bg-[oklch(0.78_0.16_70/0.05)]",
  low: "border-border bg-surface-elevated/60",
};

export function TaskPlanner() {
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"high" | "medium" | "low">("medium");
  const [timeframe, setTimeframe] = useState<"today" | "this_week" | "this_month">("today");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [prompt, setPrompt] = useState("");

  const handle = async () => {
    if (description.trim().length < 10) {
      toast.error("Describe your tasks (min 10 chars)");
      return;
    }
    setLoading(true);
    setPlan(null);
    try {
      const res = await planTasks({ data: { description, urgency, timeframe } });
      setPlan(res.plan as Plan);
      setPrompt(res.systemPrompt);
    } catch (e) {
      toast.error("Planning failed", {
        description: e instanceof Error ? e.message : "Try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <Header
        title="AI Task Planner"
        subtitle="Turn a brain-dump into a prioritized, time-blocked plan."
        icon={<ListChecks className="h-5 w-5" />}
      />

      <div className="rounded-xl border border-border bg-surface p-5">
        <Label htmlFor="tasks">Tasks (one per line or freeform)</Label>
        <Textarea
          id="tasks"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Draft Q3 roadmap, review 3 PRs, prep customer call, write status update..."
          className="mt-2 min-h-[140px] resize-none border-border bg-background"
          maxLength={4000}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Select value={urgency} onValueChange={(v) => setUrgency(v as typeof urgency)}>
            <SelectTrigger className="border-border bg-background">
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High urgency</SelectItem>
              <SelectItem value="medium">Medium urgency</SelectItem>
              <SelectItem value="low">Low urgency</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={timeframe}
            onValueChange={(v) => setTimeframe(v as typeof timeframe)}
          >
            <SelectTrigger className="border-border bg-background">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This week</SelectItem>
              <SelectItem value="this_month">This month</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handle}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Planning..." : "Generate plan"}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <LoadingShimmer lines={6} />
        </div>
      )}

      {plan && (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{plan.plan_title}</h2>
              <span className="text-xs text-muted-foreground">
                ~{plan.total_estimated_hours}h · {plan.timeframe}
              </span>
            </div>
            <div className="space-y-2">
              {plan.tasks.map((t) => (
                <div
                  key={t.priority}
                  className={`rounded-lg border p-3 ${URGENCY_STYLES[t.urgency]}`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-mono text-primary">#{t.priority}</span>
                      <span className="font-medium">{t.task}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {t.time_slot} · {t.estimated_time}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">💡 {t.tips}</p>
                </div>
              ))}
            </div>
            <SystemPromptViewer prompt={prompt} />
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <Lightbulb className="h-4 w-4 text-primary" /> Optimization tips
              </h3>
              <ul className="space-y-2 text-sm text-foreground/90">
                {plan.optimization_insights.map((i) => (
                  <li key={i} className="border-l-2 border-primary/40 pl-2">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 text-sm">
              <div className="text-xs text-muted-foreground">Buffer time</div>
              <div className="mt-1 font-medium">{plan.buffer_time}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
