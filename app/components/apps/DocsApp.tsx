"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BackLink, LightPage } from "./BackLink";

export type DocItem = { key: string; title: string; body: string };

const LS_KEY = "agentos.docs.local";

export function loadLocalDocs(): DocItem[] {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as DocItem[]) : [];
  } catch {
    return [];
  }
}

function saveLocalDocs(docs: DocItem[]) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(docs));
  } catch {}
}

function DocsHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-3">
        <BackLink />
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-6 items-end justify-center rounded-sm bg-[#2f6fde] pb-1">
            <span className="block h-0.5 w-3 bg-white shadow-[0_-4px_0_white,0_-8px_0_white]" />
          </span>
          <Link href="/docs" className="text-xl text-neutral-800">Docs</Link>
        </span>
      </div>
    </header>
  );
}

export function DocsApp({ seed }: { seed: DocItem[] }) {
  const [local, setLocal] = useState<DocItem[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => setLocal(loadLocalDocs()), []);

  const docs = [...local.slice().reverse(), ...seed];

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const next = [...local, { key: `doc_local_${Date.now().toString(36)}`, title: title.trim(), body }];
    setLocal(next);
    saveLocalDocs(next);
    setTitle("");
    setBody("");
  }

  return (
    <LightPage bg="#f1f3f4">
      <DocsHeader />
      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-8 md:grid-cols-[1fr_340px]">
        <section>
          <h1 className="mb-3 text-sm font-medium text-neutral-700">Recent documents</h1>
          <ul className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {docs.map((d) => (
              <li key={d.key} className="border-b border-neutral-100 last:border-b-0">
                <Link href={`/docs/${d.key}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#e8f0fe]">
                  <span className="flex h-7 w-5 shrink-0 items-center justify-center rounded-sm bg-[#2f6fde] text-[9px] font-bold text-white">≡</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-neutral-900">{d.title}</span>
                    <span className="block truncate text-xs text-neutral-500">{d.body.split("\n")[0] || "Empty document"}</span>
                  </span>
                  <span className="text-xs text-neutral-400">{d.key}</span>
                </Link>
              </li>
            ))}
            {docs.length === 0 && <li className="p-6 text-center text-neutral-500">No documents yet.</li>}
          </ul>
        </section>
        <aside>
          <form onSubmit={create} className="rounded-lg border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 font-medium text-neutral-900">New doc</h2>
            <label className="mb-1 block text-xs font-medium text-neutral-600" htmlFor="doc-title">Title</label>
            <input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled document"
              className="mb-3 w-full rounded border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#2f6fde]"
            />
            <label className="mb-1 block text-xs font-medium text-neutral-600" htmlFor="doc-body">Body</label>
            <textarea
              id="doc-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="Start typing…"
              className="mb-3 w-full resize-y rounded border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#2f6fde]"
            />
            <button type="submit" className="w-full rounded bg-[#2f6fde] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2459b8]">
              Create
            </button>
          </form>
        </aside>
      </main>
    </LightPage>
  );
}

export function DocView({ id, doc }: { id: string; doc: DocItem | null }) {
  const [found, setFound] = useState<DocItem | null>(doc);
  const [checked, setChecked] = useState(!!doc);

  useEffect(() => {
    if (doc) return;
    setFound(loadLocalDocs().find((d) => d.key === id) ?? null);
    setChecked(true);
  }, [doc, id]);

  return (
    <LightPage bg="#f1f3f4">
      <DocsHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        {found ? (
          <article className="min-h-[70vh] rounded-sm border border-neutral-200 bg-white px-16 py-14 shadow-sm">
            <h1 className="mb-6 text-3xl font-normal text-neutral-900">{found.title}</h1>
            <pre className="whitespace-pre-wrap font-sans text-[15px] leading-7 text-neutral-800">{found.body}</pre>
          </article>
        ) : checked ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
            <h1 className="text-xl font-medium text-neutral-900">Doc not found</h1>
            <p className="mt-2 text-sm text-neutral-500">No document with id “{id}” yet. It may still be being created.</p>
            <Link href="/docs" className="mt-4 inline-block text-sm font-medium text-[#2f6fde] hover:underline">Back to all docs</Link>
          </div>
        ) : null}
      </main>
    </LightPage>
  );
}
