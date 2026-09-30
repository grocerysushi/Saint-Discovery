import Hero from "@/components/Hero";
import type { DailySaint } from "@/lib/saint-of-day";

export default function HomePage({ dailySaint }: { dailySaint: DailySaint | null }) {
  return (
    <main className="home-refresh">
      <Hero dailySaint={dailySaint} />
    </main>
  );
}
