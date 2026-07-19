"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/resources", label: "Saints Directory" },
  { href: "/patron-saint-of", label: "Patron Saints" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu on every route change so it doesn't stay open
  // after the user taps a link.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open. Restoring on cleanup
  // means the body stays scrollable even if the component is hot-reloaded.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <header
      className="sticky top-0 z-50 border-b border-navy-lighter bg-navy/85 backdrop-blur-md"
      style={{ height: "var(--header-height)" }}
    >
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Saint Discovery home"
        >
          <span
            className="text-gold text-lg leading-none"
            aria-hidden
          >
            ✦
          </span>
          <span className="font-heading text-cream text-base sm:text-lg font-semibold tracking-wide group-hover:text-gold transition-colors">
            Saint Discovery
          </span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-6"
          aria-label="Main"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={`text-sm transition-colors ${
                isActive(pathname, link.href)
                  ? "text-gold"
                  : "text-cream-dark/80 hover:text-gold"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            className="ml-2 px-4 py-2 bg-gold text-navy font-semibold rounded-full text-sm
                       hover:bg-gold-light transition-colors"
          >
            Take the Quiz
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 text-cream-dark hover:text-gold transition-colors"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? (
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            key="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden absolute left-0 right-0 top-full bg-navy border-b border-navy-lighter shadow-lg"
            aria-label="Mobile"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={
                    isActive(pathname, link.href) ? "page" : undefined
                  }
                  className={`block px-3 py-3 rounded-lg text-base transition-colors ${
                    isActive(pathname, link.href)
                      ? "text-gold bg-navy-light/50"
                      : "text-cream-dark hover:text-gold hover:bg-navy-light/30"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/"
                className="mt-2 px-4 py-3 bg-gold text-navy font-semibold rounded-full text-center text-base
                           hover:bg-gold-light transition-colors"
              >
                Take the Quiz
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
