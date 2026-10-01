import Hero from "@/components/Hero";
import type { DailySaint } from "@/lib/saint-of-day";

export default function HomePage({ dailySaint, directoryCount }: { dailySaint: DailySaint | null; directoryCount: number }) {
  return (
    <div className="home-refresh">
      <Hero dailySaint={dailySaint} directoryCount={directoryCount} />
    </div>
  );
}
