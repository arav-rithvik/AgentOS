// Fake world in the v3 contract shapes (TASKS.md). Replaced by Supabase reads at merge (M1).
export const TODAY = "2026-10-03";

export type Job = { title: string; company: string; location: string; url: string; posted: string };
export type Obj =
  | { app: string; type: "job"; key: string; data: Job }
  | { app: "docs"; type: "doc"; key: string; data: { title: string; body: string } }
  | { app: "calendar"; type: "event"; key: string; data: { title: string; start: string; end: string } }
  | { app: "mail"; type: "mail"; key: string; data: Mail }
  | { app: "cuts"; type: "booking"; key: string; data: { service: string; barber: string; start: string; price: number } };

export type Mail = { folder: "inbox" | "sent"; from: string; email: string; to: string; subject: string; body: string; at: string; unread: boolean };
export const ME = { name: "Rithvik", email: "rithvik@agentos.dev" };
export const SHOP = { name: "Fade & Co.", host: "fadeandco.com", barbers: ["Marcus", "Dee", "Lena"], services: [{ name: "Haircut", price: 35, min: 30 }, { name: "Haircut + Beard", price: 50, min: 45 }, { name: "Lineup", price: 20, min: 15 }] };

export type Action = { id: string; run_id: string; call: string; args: Record<string, unknown>; receipt: Record<string, unknown>; ms: number; data?: unknown };
export type Run = { id: string; prompt: string; status: "running" | "done" | "error"; result: string | null; steps: number; input_tokens: number; output_tokens: number; ms: number };

export const BOARDS = [
  { id: "a", app: "board_a", name: "Launchpad", color: "#2563eb", bg: "#eff4ff" },
  { id: "b", app: "board_b", name: "InternLoop", color: "#7c3aed", bg: "#f4efff" },
  { id: "c", app: "board_c", name: "ResearchHire", color: "#ea580c", bg: "#fff4ec" },
  { id: "d", app: "board_d", name: "CampusGrid", color: "#0d9488", bg: "#ebfaf8" },
  { id: "e", app: "board_e", name: "Stackwise Jobs", color: "#db2777", bg: "#fff0f6" },
] as const;

const J = (app: string, n: number, title: string, company: string, location: string, posted: string): Obj => ({
  app,
  type: "job",
  key: `job_${app.slice(-1)}${n}`,
  data: { title, company, location, url: `/boards/${app.slice(-1)}#job_${app.slice(-1)}${n}`, posted },
});

// Some postings appear on more than one board, so dedupe has work to do.
export const seedObjects: Obj[] = [
  J("board_a", 1, "ML Research Intern", "Halcyon Labs", "San Francisco", TODAY),
  J("board_a", 2, "Machine Learning Intern, Ranking", "Vellum Pay", "New York", TODAY),
  J("board_a", 3, "Data Science Intern", "Orchard Health", "Remote", "2026-09-28"),
  J("board_a", 4, "ML Infrastructure Intern", "Cobalt AI", "Seattle", TODAY),
  J("board_a", 5, "Frontend Intern", "Brightline", "Austin", TODAY),
  J("board_a", 6, "Applied Scientist Intern", "Meridian Robotics", "Boston", "2026-09-30"),

  J("board_b", 1, "ML Research Intern", "Halcyon Labs", "San Francisco", TODAY),
  J("board_b", 2, "Computer Vision Intern", "Parallax Motors", "Palo Alto", TODAY),
  J("board_b", 3, "NLP Intern", "Quillstone", "Remote", TODAY),
  J("board_b", 4, "Backend Intern", "Ferro Systems", "Chicago", "2026-09-25"),
  J("board_b", 5, "ML Engineer Intern", "Tidepool Data", "San Francisco", "2026-09-29"),
  J("board_b", 6, "Product Design Intern", "Loomwork", "Remote", TODAY),

  J("board_c", 1, "Machine Learning Intern, Ranking", "Vellum Pay", "New York", TODAY),
  J("board_c", 2, "Reinforcement Learning Intern", "Atlas Dynamics Lab", "Pittsburgh", TODAY),
  J("board_c", 3, "ML Platform Intern", "Northstar Cloud", "Seattle", "2026-09-27"),
  J("board_c", 4, "Speech ML Intern", "Echoform", "San Jose", TODAY),
  J("board_c", 5, "Security Intern", "Bastion", "Remote", TODAY),
  J("board_c", 6, "Quant Research Intern", "Kestrel Capital", "New York", "2026-09-30"),

  J("board_d", 1, "Computer Vision Intern", "Parallax Motors", "Palo Alto", TODAY),
  J("board_d", 2, "LLM Evaluation Intern", "Prism AI", "San Francisco", TODAY),
  J("board_d", 3, "ML Infrastructure Intern", "Cobalt AI", "Seattle", TODAY),
  J("board_d", 4, "Data Engineering Intern", "Harbor Freight Tech", "Denver", "2026-09-26"),
  J("board_d", 5, "iOS Intern", "Pocketful", "Los Angeles", TODAY),
  J("board_d", 6, "Generative Models Intern", "Lumen Studio", "Remote", TODAY),

  J("board_e", 1, "NLP Intern", "Quillstone", "Remote", TODAY),
  J("board_e", 2, "ML Research Intern", "Halcyon Labs", "San Francisco", TODAY),
  J("board_e", 3, "Robotics Learning Intern", "Meridian Robotics", "Boston", TODAY),
  J("board_e", 4, "Marketing Intern", "Glow Co", "Miami", TODAY),
  J("board_e", 5, "ML Systems Intern", "Ironwood Compute", "Austin", "2026-09-29"),
  J("board_e", 6, "AI Safety Research Intern", "Clearpath Alignment", "Berkeley", TODAY),

  { app: "mail", type: "mail", key: "mail_1", data: { folder: "inbox", from: "Maya Chen", email: "maya.chen@gmail.com", to: "rithvik@agentos.dev", subject: "Coffee next week?", body: "Hey! Are you free Tuesday after 3? Want to hear how the hackathon went.\n\nMaya", at: "1:12 PM", unread: true } },
  { app: "mail", type: "mail", key: "mail_2", data: { folder: "inbox", from: "Launchpad", email: "alerts@launchpad.jobs", to: "rithvik@agentos.dev", subject: "4 new internships match your alert", body: "ML Research Intern at Halcyon Labs and 3 more roles were posted today.", at: "12:41 PM", unread: true } },
  { app: "mail", type: "mail", key: "mail_3", data: { folder: "inbox", from: "Fade & Co.", email: "hello@fadeandco.com", to: "rithvik@agentos.dev", subject: "It's been 4 weeks since your last cut", body: "Book online any time. Marcus has openings this weekend.", at: "10:05 AM", unread: false } },
  { app: "mail", type: "mail", key: "mail_4", data: { folder: "inbox", from: "Gradhire", email: "no-reply@gradhire.com", to: "rithvik@agentos.dev", subject: "Your application was received", body: "Thanks for applying to Speech ML Intern at Echoform.", at: "Yesterday", unread: false } },
  { app: "docs", type: "doc", key: "doc_1", data: { title: "Resume notes", body: "Keep it to one page. Lead with shipped projects." } },
  { app: "docs", type: "doc", key: "doc_2", data: { title: "Hackathon ideas", body: "AgentOS: the OS for agents." } },
  { app: "calendar", type: "event", key: "evt_1", data: { title: "Physics 2 study block", start: "2026-10-03T19:00", end: "2026-10-03T20:00" } },
  { app: "calendar", type: "event", key: "evt_2", data: { title: "Team sync with Arav", start: "2026-10-04T10:00", end: "2026-10-04T10:30" } },
];

export const PRESETS = [
  { label: "Weekend plan", prompt: "Tomorrow: book a haircut, 2 concert tickets and a flight home, all on my calendar." },
  { label: "Internship hunt", prompt: "Find today's ML internships across 5 boards and write me a ranked doc." },
  { label: "Study blocks", prompt: "Block study time for everything due this week." },
];
