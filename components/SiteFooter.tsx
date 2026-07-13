import Link from "next/link";

const CONTACT_EMAIL = "hello@saintdiscoveryquiz.com";

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-navy-lighter bg-navy">
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <nav
          aria-label="Footer"
          className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm mb-6"
        >
          <Link
            href="/"
            className="text-cream-dark/70 hover:text-gold transition-colors"
          >
            Take the Quiz
          </Link>
          <Link
            href="/resources"
            className="text-cream-dark/70 hover:text-gold transition-colors"
          >
            Saints Directory
          </Link>
          <Link
            href="/patron-saint-of"
            className="text-cream-dark/70 hover:text-gold transition-colors"
          >
            Patron Saints
          </Link>
          <Link
            href="/about"
            className="text-cream-dark/70 hover:text-gold transition-colors"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="text-cream-dark/70 hover:text-gold transition-colors"
          >
            Privacy
          </Link>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-cream-dark/70 hover:text-gold transition-colors"
          >
            Contact
          </a>
        </nav>
        <p className="text-cream-dark/50 text-xs">
          © {new Date().getFullYear()} Saint Discovery · Made with faith and
          curiosity
        </p>
      </div>
    </footer>
  );
}
