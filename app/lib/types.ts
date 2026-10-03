// Row shapes. These match supabase/schema.sql and the contract in TASKS.md.

export type Board = "a" | "b" | "c" | "d" | "e";

export type Job = {
  id: string;
  board: Board;
  title: string;
  company: string;
  location: string;
  url: string;
  posted_at: string;
};

export type Doc = { id: string; run_id: string | null; title: string; body: string; created_at: string };

export type CalendarEvent = {
  id: string;
  run_id: string | null;
  title: string;
  starts_at: string;
  duration_min: number;
  kind: "event" | "deadline" | "block";
};

export type Receipt = {
  action: string;
  args: Record<string, unknown>;
  result_id: string | null; // id of the new row, for a create
  count: number | null;     // number of rows, for a list
  status: "ok" | "error";
  error?: string;
  started_at: string;
  finished_at: string;
};

export type ActionLog = {
  id: number;
  run_id: string;
  ts: string;
  app: "jobboard" | "docs" | "calendar";
  action: string;
  args: Record<string, unknown>;
  receipt: Receipt;
  tokens: number | null;
  latency_ms: number | null;
};

export type Run = {
  id: string;
  preset: string;
  prompt: string;
  status: "running" | "done" | "error";
  summary: string | null;
  steps: number;
  input_tokens: number;
  output_tokens: number;
  ms: number;
  created_at: string;
};
