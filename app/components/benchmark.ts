// The comparison: the same internship task (the prompt shown on the page: components/data.ts PRESETS[1]), run by each computer-use agent.
// Fill these in from the benchmark run (exact values, not rounded). null shows as "—".
// ESTIMATES (not yet measured): screenshot-loop agents on this 5-board task. Replace with Arav's measured runs.
export const ESTIMATED = true;
//   ms: wall time in milliseconds · tokens: total tokens · actions: clicks, types and tool calls · screenshots: screenshots taken

export type Bench = { name: string; by: string; logo: string; bg: string; pad: number; ms: number | null; tokens: number | null; actions: number | null; screenshots: number | null };

export const BENCHMARK: Bench[] = [
  { name: "Muse", by: "AI agent", logo: "/agents/muse.png", bg: "#fff", pad: 0, ms: 372000, tokens: 310000, actions: 96, screenshots: 88 },
  { name: "Grok Bot", by: "xAI", logo: "/agents/grok-white.svg", bg: "#000", pad: 10, ms: 480000, tokens: 420000, actions: 124, screenshots: 117 },
  { name: "Instinct", by: "AI agent", logo: "/agents/instinct.png", bg: "#fff", pad: 2, ms: 414000, tokens: 350000, actions: 108, screenshots: 99 },
  { name: "Dots", by: "AI agent", logo: "/agents/dots.png", bg: "#000", pad: 0, ms: 438000, tokens: 365000, actions: 112, screenshots: 104 },
  { name: "Claude", by: "Anthropic, computer use", logo: "/agents/claude.svg", bg: "#fff", pad: 9, ms: 540000, tokens: 460000, actions: 131, screenshots: 126 },
];
