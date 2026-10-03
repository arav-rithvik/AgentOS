import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BOARDS, TODAY, seedObjects } from "@/components/data";
import { JobBoard, type BoardJob } from "@/components/apps/JobBoard";

export function generateStaticParams() {
  return BOARDS.map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: PageProps<"/boards/[id]">): Promise<Metadata> {
  const { id } = await params;
  const board = BOARDS.find((b) => b.id === id);
  return { title: board ? `${board.name} — Internships` : "Board not found" };
}

export default async function BoardPage({ params }: PageProps<"/boards/[id]">) {
  const { id } = await params;
  const board = BOARDS.find((b) => b.id === id);
  if (!board) notFound();

  const jobs: BoardJob[] = seedObjects.flatMap((o) =>
    o.type === "job" && o.app === board.app ? [{ key: o.key, ...o.data }] : [],
  );

  return (
    <JobBoard
      board={{ id: board.id, name: board.name, color: board.color, bg: board.bg }}
      jobs={jobs}
      today={TODAY}
    />
  );
}
