import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PARCELLES } from "@/data/parcelles";
import FicheParcelle from "@/components/parcelles/FicheParcelle";

export function generateStaticParams() {
  return PARCELLES.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = PARCELLES.find((p) => p.id === Number(id));
  if (!p) return { title: "AKAL" };
  const fmt = new Intl.NumberFormat("fr-MA");
  return {
    title: `${p.titre} — AKAL`,
    description: `${p.surface} ha · ${p.ville}, ${p.region} · ${fmt.format(p.prix)} MAD`,
  };
}

export default async function FichePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parcelle = PARCELLES.find((p) => p.id === Number(id));
  if (!parcelle) notFound();
  return <FicheParcelle parcelle={parcelle} />;
}
