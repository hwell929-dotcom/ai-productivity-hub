import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import {
  buildEmailPrompt,
  MEETING_SUMMARIZER_PROMPT,
  TASK_PLANNER_PROMPT,
  RESEARCH_PROMPT,
} from "./prompts";

const MODEL = "google/gemini-3-flash-preview";

async function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
  return createLovableAiGatewayProvider(key);
}

/* -------------------- EMAIL GENERATOR -------------------- */
const EmailInput = z.object({
  context: z.string().min(5).max(2000),
  audience: z.enum(["client", "manager", "team"]),
});

export const generateEmails = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const gateway = await getGateway();
    const model = gateway(MODEL);
    const tones = ["formal", "informal", "persuasive"] as const;
    const results = await Promise.all(
      tones.map(async (tone) => {
        const system = buildEmailPrompt(tone, data.audience);
        const res = await generateText({
          model,
          system,
          prompt: data.context,
        });
        return { tone, content: res.text, systemPrompt: system };
      }),
    );
    return { variations: results };
  });

/* -------------------- MEETING NOTES -------------------- */
const MeetingInput = z.object({ notes: z.string().min(50).max(20000) });

const MeetingSchema = z.object({
  title: z.string(),
  date: z.string().nullable(),
  attendees: z.array(z.string()),
  key_points: z.array(z.string()),
  decisions: z.array(z.string()),
  action_items: z.array(
    z.object({
      task: z.string(),
      owner: z.string().nullable(),
      deadline: z.string().nullable(),
    }),
  ),
  deadlines: z.array(z.string()),
  next_meeting: z.string().nullable(),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MeetingInput.parse(d))
  .handler(async ({ data }) => {
    const gateway = await getGateway();
    const { output } = await generateText({
      model: gateway(MODEL),
      system: MEETING_SUMMARIZER_PROMPT,
      prompt: data.notes,
      output: Output.object({ schema: MeetingSchema }),
    });
    return { summary: output, systemPrompt: MEETING_SUMMARIZER_PROMPT };
  });

/* -------------------- TASK PLANNER -------------------- */
const TaskInput = z.object({
  description: z.string().min(10).max(4000),
  urgency: z.enum(["high", "medium", "low"]),
  timeframe: z.enum(["today", "this_week", "this_month"]),
});

const TaskSchema = z.object({
  plan_title: z.string(),
  timeframe: z.string(),
  total_estimated_hours: z.number(),
  tasks: z.array(
    z.object({
      priority: z.number(),
      task: z.string(),
      estimated_time: z.string(),
      urgency: z.enum(["high", "medium", "low"]),
      time_slot: z.string(),
      tips: z.string(),
    }),
  ),
  optimization_insights: z.array(z.string()),
  buffer_time: z.string(),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TaskInput.parse(d))
  .handler(async ({ data }) => {
    const gateway = await getGateway();
    const prompt = `Tasks: ${data.description}\nOverall urgency: ${data.urgency}\nTimeframe: ${data.timeframe.replace("_", " ")}`;
    const { output } = await generateText({
      model: gateway(MODEL),
      system: TASK_PLANNER_PROMPT,
      prompt,
      output: Output.object({ schema: TaskSchema }),
    });
    return { plan: output, systemPrompt: TASK_PLANNER_PROMPT };
  });

/* -------------------- RESEARCH -------------------- */
const ResearchInput = z.object({
  content: z.string().min(100).max(20000),
  angle: z.enum(["insights", "summary", "recommendations", "simplified"]),
});

const ResearchSchema = z.object({
  source_title: z.string(),
  reading_time: z.string(),
  executive_summary: z.string(),
  key_insights: z.array(
    z.object({
      insight: z.string(),
      impact: z.string(),
      confidence: z.enum(["High", "Medium", "Low"]),
    }),
  ),
  key_statistics: z.array(z.string()),
  recommendations: z.array(z.string()),
  questions_raised: z.array(z.string()),
  related_topics: z.array(z.string()),
});

export const analyzeResearch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const gateway = await getGateway();
    const prompt = `Research angle: ${data.angle}\n\nContent:\n${data.content}`;
    const { output } = await generateText({
      model: gateway(MODEL),
      system: RESEARCH_PROMPT,
      prompt,
      output: Output.object({ schema: ResearchSchema }),
    });
    return { research: output, systemPrompt: RESEARCH_PROMPT };
  });

export type EmailResult = Awaited<ReturnType<typeof generateEmails>>;
export type MeetingResult = Awaited<ReturnType<typeof summarizeMeeting>>;
export type PlanResult = Awaited<ReturnType<typeof planTasks>>;
export type ResearchResult = Awaited<ReturnType<typeof analyzeResearch>>;
