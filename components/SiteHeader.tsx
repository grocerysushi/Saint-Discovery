"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [{href:"/saint-of-day",label:"Saint of the day"},{href:"/resources",label:"Saints directory"},{href:"/patron-saint-of",label:"Patron saints"},{href:"/confirmation-saint-guide",label:"Confirmation guide"},{href:"/blog",label:"Blog"}];

export default function SiteHeader() {
  const pathname = usePathname();
  return <HeaderNavigation key={pathname} pathname={pathname} />;
}

function HeaderNavigation({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    const onPointer = (event: PointerEvent) => {
      if (!nav.current?.contains(event.target as Node) && !toggle.current?.contains(event.target as Node)) setOpen(false);
    };
    const onResize = () => { if (window.innerWidth > 1200) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onResize);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onPointer); window.removeEventListener("resize", onResize); };
  }, [open]);
  const links = LINKS.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="nav-link" aria-current={pathname === link.href || pathname.startsWith(link.href + "/") ? "page" : undefined}>{link.label}</Link>);
  return (
    <header className="site-header">
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <div className="site-width header-inner">
        <Link href="/" className="brand" aria-label="Saint Discovery home" onClick={() => setOpen(false)}><span className="brand-mark" aria-hidden>✦</span><span className="brand-name">Saint Discovery</span></Link>
        <nav className="desktop-nav" aria-label="Main">{links}<Link href="/quiz" className="btn-primary">Take the quiz <span aria-hidden>↗</span></Link></nav>
        <button ref={toggle} className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d={open ? "M6 6l12 12M6 18L18 6" : "M4 8h16M4 16h16"} /></svg></button>
      </div>
      {open && <nav ref={nav} id="mobile-nav" className="mobile-nav" aria-label="Mobile">{links}<Link href="/quiz" onClick={() => setOpen(false)} className="btn-primary">Take the quiz ↗</Link></nav>}
    </header>
  );
}
