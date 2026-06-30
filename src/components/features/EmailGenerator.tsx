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
import { generateEmails } from "@/lib/ai.functions";
import { OutputCard } from "@/components/dashboard/OutputCard";
import { LoadingShimmer } from "@/components/dashboard/LoadingShimmer";
import { Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Variation = { tone: string; content: string; systemPrompt: string };

export function EmailGenerator() {
  const [context, setContext] = useState("");
  const [audience, setAudience] = useState<"client" | "manager" | "team">("manager");
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<Variation[]>([]);

  const handle = async () => {
    if (context.trim().length < 5) {
      toast.error("Add a bit more context (min 5 characters)");
      return;
    }
    setLoading(true);
    setOutputs([]);
    try {
      const res = await generateEmails({ data: { context, audience } });
      setOutputs(res.variations);
    } catch (e) {
      toast.error("Generation failed", {
        description: e instanceof Error ? e.message : "Try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <Header
        title="Smart Email Generator"
        subtitle="Generates three tone variations side-by-side. Edit, copy, or save the one that fits."
        icon={<Mail className="h-5 w-5" />}
      />

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_200px]">
          <div className="space-y-2">
            <Label htmlFor="email-context">Context</Label>
            <Textarea
              id="email-context"
              placeholder="e.g. Need to request flexible working hours starting next month..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="min-h-[120px] resize-none border-border bg-background"
              maxLength={2000}
            />
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <Label className="mb-2 block">Audience</Label>
              <Select
                value={audience}
                onValueChange={(v) => setAudience(v as typeof audience)}
              >
                <SelectTrigger className="border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handle}
              disabled={loading}
              className="mt-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? "Generating..." : "Generate variations"}
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          ⚠ AI may not capture all nuances. Always review before sending.
        </p>
      </div>

      {loading && (
        <div className="grid gap-4 lg:grid-cols-3">
          {["Formal", "Informal", "Persuasive"].map((t) => (
            <div key={t} className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-3 text-sm font-semibold">{t}</div>
              <LoadingShimmer lines={6} />
            </div>
          ))}
        </div>
      )}

      {outputs.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          {outputs.map((v) => (
            <OutputCard
              key={v.tone}
              type="email"
              title={`${v.tone[0].toUpperCase()}${v.tone.slice(1)} tone`}
              content={v.content}
              systemPrompt={v.systemPrompt}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Header({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg border border-border-strong bg-surface p-2 text-primary">
        {icon}
      </div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
