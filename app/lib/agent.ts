import Anthropic from "@anthropic-ai/sdk";
import { admin } from "./supabase-admin";
import { call } from "./drivers";
import { ACTIONS, manifest } from "./manifest";

const MODEL = process.env.AGENTOS_MODEL ?? "claude-opus-5-5";
const MAX_STEPS = 10;

// The agent has one tool. Every app is reached the same way: an action name and typed args.
const tools: Anthropic.Tool[] = [
  {
    name: "call",
    description: "Run one typed call on AgentOS. Returns a receipt and the data.",
    input_schema: {
      type: "object",
      properties: {
        action: { type: "string", enum: [...ACTIONS] },
        args: { type: "object" },
      },
      required: ["action", "args"],
    },
  },
];

function system() {
  const now = new Date();
  const local = now.toLocaleString("sv-SE", { timeZone: "America/Los_Angeles" }).replace(" ", "T");
  return `You are an agent running on AgentOS, a computer made for agents. There is no screen. Each app is typed data and typed calls.

Manifest (every app and call on this computer):
${JSON.stringify(manifest)}

Now: ${local} local time, America/Los_Angeles. In UTC: ${now.toISOString()}.

Rules:
- Make all independent calls in the same turn. Query the 5 job boards in one turn, with 5 calls.
- Every call returns { receipt, data }. If receipt.status is "ok", the call did what you asked. Do not call again to check.
- If receipt.status is "error", read receipt.error and fix the args.
- Use only data from the calls. Do not invent jobs, links or events.
- Times you send must be ISO with an offset, for example 2026-10-04T19:00:00-07:00.
- When the task is done, reply with ONE short line that states the numbers, for example: "16 roles on 5 boards, 10 after dedupe, ranked doc written."`;
}

/** Run the agent for one run until it stops. Updates the runs row after each model turn. */
export async function runAgent(runId: string, prompt: string) {
  const db = admin();
  const client = new Anthropic();
  const started = Date.now();
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];

  let steps = 0;
  let input_tokens = 0;
  let output_tokens = 0;
  let summary = "";
  let status: "done" | "error" = "done";

  try {
    while (steps < MAX_STEPS) {
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        system: system(),
        tools,
        messages,
        output_config: { effort: "low" },
      });
      steps++;
      const turnIn = res.usage.input_tokens + (res.usage.cache_read_input_tokens ?? 0) + (res.usage.cache_creation_input_tokens ?? 0);
      input_tokens += turnIn;
      output_tokens += res.usage.output_tokens;
      await db.from("runs").update({ steps, input_tokens, output_tokens, ms: Date.now() - started }).eq("id", runId);

      const text = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join(" ")
        .trim();
      if (text) summary = text;

      if (res.stop_reason !== "tool_use") {
        if (res.stop_reason === "refusal") {
          status = "error";
          summary = "The model declined this request.";
        }
        break;
      }

      const uses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
      const share = Math.round((turnIn + res.usage.output_tokens) / uses.length);
      // All calls from one turn run at the same time.
      const results = await Promise.all(
        uses.map(async (u): Promise<Anthropic.ToolResultBlockParam> => {
          const input = u.input as { action?: string; args?: Record<string, unknown> };
          const out = await call(runId, String(input.action), input.args ?? {}, share);
          return { type: "tool_result", tool_use_id: u.id, content: JSON.stringify(out), is_error: out.receipt.status === "error" };
        }),
      );
      messages.push({ role: "assistant", content: res.content });
      messages.push({ role: "user", content: results });
    }
  } catch (e) {
    status = "error";
    summary = e instanceof Error ? e.message : String(e);
  }

  await db
    .from("runs")
    .update({ status, summary, steps, input_tokens, output_tokens, ms: Date.now() - started })
    .eq("id", runId);
}
