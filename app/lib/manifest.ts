// The manifest: every app on this computer and every typed call it has.
// The agent reads this at the start of a run, so it never has to look around.

export const BOARDS = {
  a: "Launchpad",
  b: "InternLoop",
  c: "ResearchHire",
  d: "CampusGrid",
  e: "Stackwise Jobs",
} as const;

export const manifest = {
  apps: {
    jobboard: {
      about: "Five job boards. Query one board per call.",
      boards: BOARDS,
      actions: {
        "jobboard.jobs.list": {
          args: { board: "a|b|c|d|e (required)", query: "string, optional keywords", posted: "today|any (default any)" },
          returns: "[{ id, title, company, location, url, posted, board }]",
        },
      },
    },
    docs: {
      about: "Documents with a title and a body (markdown).",
      actions: {
        "docs.create": { args: { title: "string", body: "string" }, returns: "{ id, url }" },
        "docs.list": { args: {}, returns: "[{ id, title, url }]" },
      },
    },
    calendar: {
      about: "The user's calendar. kind is event, deadline (something due) or block (study time).",
      actions: {
        "calendar.list": { args: { kind: "event|deadline|block, optional" }, returns: "[{ id, title, start, durationMin, kind }]" },
        "calendar.create": { args: { title: "string", start: "ISO time with offset", durationMin: "number" }, returns: "{ id }" },
      },
    },
  },
} as const;

export const ACTIONS = [
  "jobboard.jobs.list",
  "docs.create",
  "docs.list",
  "calendar.list",
  "calendar.create",
] as const;

export type ActionName = (typeof ACTIONS)[number];
