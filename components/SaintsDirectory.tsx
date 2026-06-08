"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Saint } from "@/lib/types";

export default function SaintsDirectory({ saints }: { saints: Saint[] }) {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return saints.filter((s) => {
      const matchesSearch =
        q === "" ||
        s.name.toLowerCase().includes(q) ||
        (s.tagline && s.tagline.toLowerCase().includes(q)) ||
        (s.feast_day && s.feast_day.toLowerCase().includes(q));
      const matchesGender =
        genderFilter === "All" || s.gender === genderFilter;
      return matchesSearch && matchesGender;
    });
  }, [saints, search, genderFilter]);

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
            placeholder="Search by name, description, or feast day..."
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
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-cream-dark/60">No saints match your search.</p>
        </div>
      ) : (
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
    </div>
  );
}
