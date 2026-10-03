import { seedObjects } from "@/components/data";
import { DocsApp, type DocItem } from "@/components/apps/DocsApp";

export const metadata = { title: "Docs" };

export default function DocsPage() {
  const seed: DocItem[] = seedObjects.flatMap((o) => (o.type === "doc" ? [{ key: o.key, ...o.data }] : []));
  return <DocsApp seed={seed} />;
}
