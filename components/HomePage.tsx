import Hero from "@/components/Hero";
import type { DailySaint } from "@/lib/saint-of-day";

export default function HomePage({ dailySaint }: { dailySaint: DailySaint | null }) {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/30 to-navy pointer-events-none" />
      <div className="relative z-10"><Hero dailySaint={dailySaint} /></div>
    </main>
  );
}
