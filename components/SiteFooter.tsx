import Link from "next/link";
import PrivacyChoices from "@/components/PrivacyChoices";
export default function SiteFooter() {
  return <footer className="site-footer site-footer-refresh"><div className="site-width">
    <div className="footer-top"><Link prefetch={false} href="/" className="brand"><span className="brand-name">Saint Discovery</span></Link>
      <nav aria-label="Footer"><Link prefetch={false} href="/quiz">Take the quiz</Link><Link prefetch={false} href="/saint-of-day">Saint of the day</Link><Link prefetch={false} href="/resources">Saints directory</Link><Link prefetch={false} href="/patron-saint-of">Patron saints</Link><Link prefetch={false} href="/confirmation-saint-guide">Confirmation guide</Link><Link prefetch={false} href="/resources/reading">Guided reading</Link><Link prefetch={false} href="/resources/teachers">Teachers &amp; catechists</Link><Link prefetch={false} href="/blog">Blog</Link><Link prefetch={false} href="/about">About</Link><Link prefetch={false} href="/editorial-policy">Editorial approach</Link></nav>
    </div>
    <div className="footer-bottom"><p>© {new Date().getFullYear()} Saint Discovery. Made with faith &amp; curiosity.</p><div className="flex flex-wrap gap-6"><Link prefetch={false} href="/privacy">Privacy</Link><PrivacyChoices /><a href="mailto:hello@saintdiscoveryquiz.com">Get in touch ↗</a></div></div>
  </div></footer>;
}
