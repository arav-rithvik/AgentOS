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
      "Look at my calendar. For each deadline this week, add one 90-minute study block the evening before it (between 17:00 and 22:00 local time). A block must not overlap any other event or block. Use kind \"block\". Title each block \"Study: <what is due>\".",
  },
  weekend: {
    label: "Tomorrow: book a haircut, 2 concert tickets and a flight home, all on my calendar.",
    prompt:
      "Plan tomorrow and the day after for me. (1) Book the cheapest haircut tomorrow morning, before 12:00. (2) Book 2 tickets to a concert in San Francisco tomorrow night, under $60 each. (3) Book the cheapest flight from SFO to LAX the day after tomorrow that departs after 17:00. Nothing may overlap anything already on my calendar or each other. Then put all three on my calendar with the correct start and length.",
  },
} as const;

export type PresetName = keyof typeof PRESETS;
