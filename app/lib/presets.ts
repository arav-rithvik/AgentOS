// The preset tasks a judge can run. No free text.

export const PRESETS = {
  internships: {
    label: "Find today's ML internships across 5 boards and write me a ranked doc.",
    prompt:
      "Find the ML internships posted today on all 5 job boards. Remove duplicates (the same company and title on more than one board is one role). Rank them, best first, for a student who wants hands-on ML research or engineering. Write the ranked list to a new doc titled \"ML internships - today\". Each line: rank, title, company, location, link, and which boards list it.",
  },
  study: {
    label: "Block study time for everything due this week.",
    prompt:
      "Look at my calendar. For each deadline this week, add one 90-minute study block the evening before it (between 17:00 and 22:00 local time). A block must not overlap any other event or block. Title each block \"Study: <what is due>\".",
  },
} as const;

export type PresetName = keyof typeof PRESETS;
