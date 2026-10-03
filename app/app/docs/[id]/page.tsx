import { seedObjects } from "@/components/data";
import { DocView } from "@/components/apps/DocsApp";

export default async function DocPage({ params }: PageProps<"/docs/[id]">) {
  const { id } = await params;
  const o = seedObjects.find((x) => x.type === "doc" && x.key === id);
  const doc = o && o.type === "doc" ? { key: o.key, ...o.data } : null;
  return <DocView id={id} doc={doc} />;
}
