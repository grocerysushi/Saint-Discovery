import Link from "next/link";
import PrivacyChoices from "@/components/PrivacyChoices";
export default function SiteFooter() {
  return <footer className="site-footer site-footer-refresh gallery-footer"><div className="site-width">
    <div className="gallery-footer-main">
      <div><Link prefetch={false} href="/" className="gallery-footer-brand">Saint Discovery</Link><p>Stories of faith, carefully told.</p></div>
      <nav className="gallery-footer-primary" aria-label="Footer"><Link prefetch={false} href="/about">About</Link><Link prefetch={false} href="/editorial-policy">Editorial approach</Link><Link prefetch={false} href="/privacy">Privacy</Link><PrivacyChoices /></nav>
    </div>
    <details className="gallery-footer-more"><summary>More site links</summary><nav aria-label="More site links"><Link prefetch={false} href="/quiz">Take the quiz</Link><Link prefetch={false} href="/saint-of-day">Saint of the day</Link><Link prefetch={false} href="/resources">Saints directory</Link><Link prefetch={false} href="/patron-saint-of">Patron saints</Link><Link prefetch={false} href="/confirmation-saint-guide">Confirmation guide</Link><Link prefetch={false} href="/resources/reading">Guided reading</Link><Link prefetch={false} href="/resources/teachers">Teachers &amp; catechists</Link><Link prefetch={false} href="/blog">Blog</Link><a href="mailto:hello@saintdiscoveryquiz.com">Get in touch</a></nav></details>
    <p className="gallery-footer-copyright">© {new Date().getFullYear()} Saint Discovery.</p>
  </div></footer>;
}
