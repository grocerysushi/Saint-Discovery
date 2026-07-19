"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Saint } from "@/lib/types";

interface PatronTopicMini {
  slug: string;
  label: string;
  saintCount: number;
}

export default function SaintsDirectory({
  saints,
  patronTopics = [],
}: {
  saints: Saint[];
  patronTopics?: PatronTopicMini[];
}) {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("All");

  const q = search.toLowerCase().trim();

  // Patron-topic matches: when the user types a query that lines up with a
  // patronage (e.g. "doctors", "anxiety", "lost causes"), surface a link to
  // the /patron-saint-of/[topic] page as a result. This is the high-intent
  // search case the previous version missed entirely.
  const topicMatches = useMemo(() => {
    if (q === "") return [];
    return patronTopics
      .filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          q.includes(t.label.toLowerCase())
      )
      .slice(0, 3);
  }, [q, patronTopics]);

  const filtered = useMemo(() => {
    if (q === "") {
      return saints.filter(
        (s) => genderFilter === "All" || s.gender === genderFilter
      );
    }
    return saints.filter((s) => {
      if (genderFilter !== "All" && s.gender !== genderFilter) return false;
      // Whole-word match on patron_of so "anxiety" doesn't match against a
      // comma-list that happens to contain the substring. Fall back to a
      // plain substring for everything else where partial matches are fine.
      const patronOf = (s.patron_of ?? "").toLowerCase();
      const patronTerms = patronOf
        .split(/,\s*/)
        .map((t) => t.trim())
        .filter(Boolean);
      const patronHit =
        patronTerms.some((t) => t === q) ||
        patronTerms.some((t) => t.includes(q)) ||
        patronOf.includes(q);

      return (
        s.name.toLowerCase().includes(q) ||
        (s.tagline && s.tagline.toLowerCase().includes(q)) ||
        (s.feast_day && s.feast_day.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.origin && s.origin.toLowerCase().includes(q)) ||
        patronHit
      );
    });
  }, [saints, q, genderFilter]);

  const hasNoResults = filtered.length === 0 && topicMatches.length === 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <label htmlFor="saint-search" className="sr-only">
            Search saints
          </label>
          <input
            id="saint-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, patronage, description, or feast day..."
            className="w-full px-4 py-3 rounded-xl bg-navy-light border border-navy-lighter
                       text-cream placeholder:text-cream-dark/40 text-sm
                       focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <div className="flex gap-2" role="group" aria-label="Filter by gender">
          {["All", "Male", "Female"].map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              aria-pressed={genderFilter === g}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                genderFilter === g
                  ? "bg-gold text-navy"
                  : "bg-navy-light border border-navy-lighter text-cream-dark hover:border-gold/40"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <p className="text-cream-dark/40 text-xs uppercase tracking-wider mb-4">
        {filtered.length} saint{filtered.length !== 1 ? "s" : ""} found
        {topicMatches.length > 0 &&
          ` · ${topicMatches.length} patronage${topicMatches.length !== 1 ? "s" : ""} match`}
      </p>

      {hasNoResults ? (
        <div className="text-center py-16">
          <p className="text-cream-dark/60">
            No saints or patronages match your search.
          </p>
          <p className="text-cream-dark/40 text-sm mt-2">
            Try a different keyword, or browse the{" "}
            <Link
              href="/patron-saint-of"
              className="text-gold hover:text-gold-light underline"
            >
              full patron saint index
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          {topicMatches.length > 0 && (
            <div className="mb-6">
              <p className="text-cream-dark/60 text-xs uppercase tracking-wider mb-3">
                Patronage matches
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topicMatches.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/patron-saint-of/${t.slug}`}
                    className="block rounded-2xl border border-gold/30 bg-gradient-to-br
                               from-navy-light/80 to-navy-light/40 p-4
                               hover:border-gold/60 transition-colors"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-gold text-lg" aria-hidden>
                        ✦
                      </span>
                      <h3 className="text-cream font-semibold text-base capitalize">
                        Patron Saint of {t.label}
                      </h3>
                    </div>
                    <p className="text-cream-dark/60 text-xs ml-6">
                      {t.saintCount} saint{t.saintCount !== 1 ? "s" : ""} →
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((saint) => (
                  <motion.div
                    key={saint.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={`/saints/${saint.slug}`}
                      className="block h-full rounded-2xl border border-navy-lighter bg-navy-light/30
                                 hover:border-gold/40 transition-colors p-5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-cream font-semibold text-base truncate">
                          St. {saint.name}
                        </h3>
                        <span className="text-cream-dark/30 text-xs shrink-0 ml-2">
                          {saint.gender === "Female" ? "♀" : "♂"}
                        </span>
                      </div>
                      {saint.feast_day && (
                        <p className="text-gold/50 text-xs mb-2">
                          {saint.feast_day}
                        </p>
                      )}
                      {saint.tagline && (
                        <p className="text-gold-light/70 text-sm italic line-clamp-2">
                          &ldquo;{saint.tagline}&rdquo;
                        </p>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
