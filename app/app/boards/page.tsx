import Link from "next/link";
import { BOARDS, seedObjects } from "@/components/data";
import { BackLink, LightPage } from "@/components/apps/BackLink";

export const metadata = { title: "Job boards" };

export default function BoardsIndex() {
  return (
    <LightPage bg="#f7f7f8">
      <main className="mx-auto max-w-3xl px-6 py-6">
        <BackLink />
        <h1 className="mt-4 text-3xl font-bold text-neutral-900">Job boards</h1>
        <p className="mt-1 text-neutral-600">Five internship sites, each with its own listings.</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {BOARDS.map((b) => {
            const n = seedObjects.filter((o) => o.type === "job" && o.app === b.app).length;
            return (
              <li key={b.id}>
                <Link
                  href={`/boards/${b.id}`}
                  className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 hover:shadow-md"
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-white"
                    style={{ background: b.color }}
                  >
                    {b.name[0]}
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-neutral-900">{b.name}</span>
                    <span className="block text-sm text-neutral-500">{n} internships · /boards/{b.id}</span>
                  </span>
                  <span className="text-neutral-400">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </LightPage>
  );
}
