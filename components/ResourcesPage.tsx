"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { insforge } from "@/lib/insforge";
import { Saint } from "@/lib/types";

const RESOURCES = [
  {
    name: "The Vatican",
    url: "https://www.vatican.va",
    description:
      "The official website of the Holy See â€” papal documents, encyclicals, and news from the heart of the Catholic Church.",
  },
  {
    name: "USCCB",
    url: "https://www.usccb.org",
    description:
      "The United States Conference of Catholic Bishops â€” daily readings, Church teachings, and resources for Catholic life in America.",
  },
  {
    name: "Catholic Answers",
    url: "https://www.catholic.com",
    description:
      "The world's largest source for Catholic apologetics â€” articles, podcasts, and answers to questions about the faith.",
  },
];

function getTodayFeastDay(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export default function ResourcesPage() {
  const [saints, setSaints] = useState<Saint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const todayStr = getTodayFeastDay();

  const saintsOfTheDay = useMemo(() => {
    return saints.filter(
      (s) => s.feast_day && s.feast_day.trim() === todayStr
    );
  }, [saints, todayStr]);

  useEffect(() => {
    async function load() {
      const res = await insforge.database
        .from("saints")
        .select()
        .order("name", { ascending: true });
      setSaints((res.data || []) as Saint[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return saints.filter((s) => {
      const matchesSearch =
        search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.tagline && s.tagline.toLowerCase().includes(search.toLowerCase())) ||
        (s.feast_day && s.feast_day.toLowerCase().includes(search.toLowerCase()));
      const matchesGender =
        genderFilter === "All" || s.gender === genderFilter;
      return matchesSearch && matchesGender;
    });
  }, [saints, search, genderFilter]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/30 to-navy pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Link
            href="/"
            className="inline-block text-gold/50 hover:text-gold text-sm transition-colors mb-6"
          >
            &larr; Back to Quiz
          </Link>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-4">
            Resources
          </h1>
          <p className="text-cream-dark text-lg max-w-xl mx-auto">
            Deepen your faith with trusted Catholic resources, and explore the
            full directory of saints.
          </p>
        </motion.div>

        {!loading && saintsOfTheDay.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-heading font-semibold text-cream mb-6">
              Saint of the Day
            </h2>
            <p className="text-cream-dark/50 text-sm mb-4">{todayStr}</p>
            <div className="grid gap-4">
              {saintsOfTheDay.map((saint) => (
                <div
                  key={saint.id}
                  className="rounded-2xl border border-gold/30 bg-gradient-to-br from-navy-light/80 to-navy-light/40 p-6"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">&#10022;</span>
                    <h3 className="text-2xl font-heading font-bold text-cream">
                      St. {saint.name}
                    </h3>
                  </div>
                  {saint.tagline && (
                    <p className="text-gold-light text-sm italic mb-4 ml-8">
                      &ldquo;{saint.tagline}&rdquo;
                    </p>
                  )}
                  {saint.description && (
                    <p className="text-cream-dark/80 text-sm leading-relaxed mb-4">
                      {saint.description}
                    </p>
                  )}
                  {saint.prayer && (
                    <div className="bg-navy/40 rounded-xl p-4 border border-navy-lighter">
                      <p className="text-gold/50 text-xs uppercase tracking-wider mb-2">
                        Prayer
                      </p>
                      <p className="text-cream-dark/70 text-sm italic leading-relaxed">
                        {saint.prayer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-heading font-semibold text-cream mb-6">
            Catholic Resources
          </h2>
          <div className="grid gap-4">
            {RESOURCES.map((r, i) => (
              <motion.a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ x: 6 }}
                className="block p-5 rounded-xl border border-navy-lighter bg-navy-light/40
                           hover:border-gold/40 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-cream group-hover:text-gold transition-colors">
                    {r.name}
                  </h3>
                  <span className="text-gold/40 group-hover:text-gold/70 text-sm transition-colors">
                    &rarr;
                  </span>
                </div>
                <p className="text-cream-dark/70 text-sm leading-relaxed">
                  {r.description}
                </p>
              </motion.a>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-semibold text-cream mb-2">
              Saints Directory
            </h2>
            <p className="text-cream-dark/60 text-sm">
              {loading
                ? "Loading..."
                : `${saints.length} saints â€” explore everyone you could match with.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, description, or feast day..."
                className="w-full px-4 py-3 rounded-xl bg-navy-light border border-navy-lighter
                           text-cream placeholder:text-cream-dark/40 text-sm
                           focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {["All", "Male", "Female"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
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

          {!loading && (
            <p className="text-cream-dark/40 text-xs uppercase tracking-wider mb-4">
              {filtered.length} saint{filtered.length !== 1 ? "s" : ""} found
            </p>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="text-gold/60 animate-pulse text-lg">
                Loading saints...
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-cream-dark/60">
                No saints match your search.
              </p>
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
                    onClick={() =>
                      setExpanded(expanded === saint.id ? null : saint.id)
                    }
                    className="rounded-2xl border border-navy-lighter bg-navy-light/30
                               hover:border-gold/30 transition-colors cursor-pointer p-5 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-cream font-semibold text-base truncate">
                        St. {saint.name}
                      </h3>
                      <span className="text-cream-dark/30 text-xs shrink-0 ml-2">
                        {saint.gender === "Female" ? "â™€" : "â™‚"}
                      </span>
                    </div>
                    {saint.feast_day && (
                      <p className="text-gold/50 text-xs mb-2">
                        {saint.feast_day}
                      </p>
                    )}
                    {saint.tagline && (
                      <p className="text-gold-light/70 text-sm italic mb-2 line-clamp-2">
                        &ldquo;{saint.tagline}&rdquo;
                      </p>
                    )}

                    <AnimatePresence>
                      {expanded === saint.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 mt-3 border-t border-gold/20">
                            {saint.description && (
                              <p className="text-cream-dark/70 text-sm leading-relaxed mb-3">
                                {saint.description}
                              </p>
                            )}
                            {saint.prayer && (
                              <div className="bg-navy/40 rounded-lg p-3 border border-navy-lighter">
                                <p className="text-gold/50 text-xs uppercase tracking-wider mb-1">
                                  Prayer
                                </p>
                                <p className="text-cream-dark/60 text-xs italic leading-relaxed">
                                  {saint.prayer}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1 }}
          className="text-center mt-16 text-cream-dark text-sm"
        >
          <Link href="/" className="hover:text-gold transition-colors">
            &larr; Take the Quiz
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
