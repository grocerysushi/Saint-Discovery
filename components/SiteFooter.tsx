import Link from "next/link";
export default function SiteFooter() {
  return <footer className="site-footer"><div className="site-width">
    <div className="footer-top"><Link href="/" className="brand"><span className="brand-mark" aria-hidden>✦</span><span className="brand-name">Saint Discovery</span></Link>
      <nav aria-label="Footer"><Link href="/quiz">Take the quiz</Link><Link href="/saint-of-day">Saint of the day</Link><Link href="/resources">Saints directory</Link><Link href="/patron-saint-of">Patron saints</Link><Link href="/confirmation-saint-guide">Confirmation guide</Link><Link href="/resources/teachers">Teachers &amp; catechists</Link><Link href="/blog">Journal</Link><Link href="/about">About</Link><Link href="/editorial-policy">Editorial approach</Link></nav>
    </div>
    <div className="footer-bottom"><p>© {new Date().getFullYear()} Saint Discovery. Made with faith &amp; curiosity.</p><div className="flex flex-wrap gap-6"><Link href="/privacy">Privacy</Link><a href="mailto:hello@saintdiscoveryquiz.com">Get in touch ↗</a></div></div>
  </div></footer>;
}
