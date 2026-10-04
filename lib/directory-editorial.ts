import evidenceData from "@/lib/data/directory-evidence-notes.json";
import correctionData from "@/lib/data/directory-corrections.json";
import { canonicalSaintSlug, getBiographyReview } from "@/lib/saint-reviews";
import { getSaintContribution } from "@/lib/saint-contributions";

type Source = { title: string; url: string };
export interface EvidenceNote {
  reviewed_on: string;
  history: { text: string; sources: Source[] };
  calendar: { text: string; sources: Source[] };
}
export interface DirectoryCorrection {
  id: string;
  date: string;
  slug: string | null;
  type: "correction" | "clarification";
  title: string;
  before: string;
  after: string;
  method: string;
  sources: Source[];
}

export const directoryEvidenceNotes = evidenceData as Record<string, EvidenceNote>;
export const directoryCorrections = correctionData as DirectoryCorrection[];

export function getDirectoryEvidenceNote(slug: string): EvidenceNote | null {
  return directoryEvidenceNotes[canonicalSaintSlug(slug)] ?? null;
}

export function getDirectoryCorrections(slug: string): DirectoryCorrection[] {
  const canonical = canonicalSaintSlug(slug);
  return directoryCorrections.filter(entry => entry.slug === canonical);
}

// ISO dates sort chronologically. Use actual content revisions, never build time.
export function getBiographyUpdatedOn(slug: string): string | null {
  const canonical = canonicalSaintSlug(slug);
  const dates = [getBiographyReview(canonical)?.reviewed_on,
    getSaintContribution(canonical)?.reviewed_on,
    getDirectoryEvidenceNote(canonical)?.reviewed_on].filter((date): date is string => Boolean(date));
  return dates.sort().at(-1) ?? null;
}
