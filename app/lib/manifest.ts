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
        "calendar.create": {
          args: { title: "string", start: "ISO time with offset", durationMin: "number", kind: "event|block (default event; use block for study time)" },
          returns: "{ id }",
        },
      },
    },
    flights: {
      about: "Flight search and booking. Airports are codes: SFO, LAX, SEA, JFK.",
      actions: {
        "flights.search": {
          args: { from: "airport code", to: "airport code", date: "YYYY-MM-DD local, optional", after: "HH:MM local, optional", maxPrice: "number, optional" },
          returns: "[{ id, airline, from, to, departs, arrives, price, seatsLeft }] cheapest first",
        },
        "flights.book": { args: { flightId: "string" }, returns: "{ id, confirmation, price }" },
      },
    },
    salon: {
      about: "Haircut appointments at three salons: SuperSnips, North Beach Barbers, Shear Avenue.",
      actions: {
        "salon.slots.list": {
          args: { date: "YYYY-MM-DD local, optional", salon: "string, optional", before: "HH:MM local, optional", maxPrice: "number, optional" },
          returns: "[{ id, salon, stylist, service, start, durationMin, price }]",
        },
        "salon.book": { args: { slotId: "string" }, returns: "{ id, confirmation, price }" },
      },
    },
    concerts: {
      about: "Concert tickets.",
      actions: {
        "concerts.search": {
          args: { query: "artist or genre, optional", city: "string, optional", date: "YYYY-MM-DD local, optional", maxPrice: "number per ticket, optional" },
          returns: "[{ id, artist, genre, venue, city, start, durationMin, price, ticketsLeft }]",
        },
        "concerts.book": { args: { concertId: "string", qty: "number" }, returns: "{ id, confirmation, price }" },
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
  "flights.search",
  "flights.book",
  "salon.slots.list",
  "salon.book",
  "concerts.search",
  "concerts.book",
] as const;

export type ActionName = (typeof ACTIONS)[number];
