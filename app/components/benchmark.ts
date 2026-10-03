// The comparison: the same internship task ("Find today's ML internships across 5 boards and write me a ranked doc."), run by each computer-use agent.
// Fill these in from the benchmark run (exact values, not rounded). null shows as "—".
//   ms: wall time in milliseconds · tokens: total tokens · actions: clicks, types and tool calls · screenshots: screenshots taken

export type Bench = { name: string; by: string; logo: string; bg: string; pad: number; ms: number | null; tokens: number | null; actions: number | null; screenshots: number | null };

export const BENCHMARK: Bench[] = [
  { name: "Muse", by: "AI agent", logo: "/agents/muse.png", bg: "#fff", pad: 0, ms: null, tokens: null, actions: null, screenshots: null },
  { name: "Grok Bot", by: "xAI", logo: "/agents/grok-white.svg", bg: "#000", pad: 10, ms: null, tokens: null, actions: null, screenshots: null },
  { name: "Instinct", by: "AI agent", logo: "/agents/instinct.png", bg: "#fff", pad: 2, ms: null, tokens: null, actions: null, screenshots: null },
  { name: "Dots", by: "AI agent", logo: "/agents/dots.png", bg: "#000", pad: 0, ms: null, tokens: null, actions: null, screenshots: null },
  { name: "Claude", by: "Anthropic, computer use", logo: "/agents/claude.svg", bg: "#fff", pad: 9, ms: null, tokens: null, actions: null, screenshots: null },
];
