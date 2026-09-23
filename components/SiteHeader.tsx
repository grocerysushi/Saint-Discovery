"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const GROUPS = [
  { id: "saints", label: "Explore saints", links: [
    { href: "/resources", label: "Saints directory", description: "Discover their lives, virtues, and prayers." },
    { href: "/patron-saint-of", label: "Patron saints", description: "Find a saint for your work or life's needs." },
  ] },
  { id: "guides", label: "Guides", links: [
    { href: "/confirmation-saint-guide", label: "Confirmation guide", description: "Choose a saint to walk with you." },
    { href: "/resources/teachers", label: "Teachers & catechists", description: "Free worksheets and lesson resources." },
  ] },
];

function Chevron() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="m6 9 6 6 6-6" /></svg>;
}

export default function SiteHeader() {
  const pathname = usePathname();
  return <HeaderNavigation key={pathname} pathname={pathname} />;
}

function HeaderNavigation({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const panelToggle = useRef<HTMLButtonElement | null>(null);
  const close = () => { setOpen(false); setPanel(null); };
  const isCurrent = (href: string) => pathname === href || (href !== "/resources" && pathname.startsWith(href + "/"));
  useEffect(() => {
    if (!open && !panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false); setPanel(null);
        (open ? toggle.current : panelToggle.current)?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) { setOpen(false); setPanel(null); }
    };
    const breakpoint = window.matchMedia("(max-width: 1000px)");
    const onResize = () => { setOpen(false); setPanel(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    breakpoint.addEventListener("change", onResize);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onPointer); breakpoint.removeEventListener("change", onResize); };
  }, [open, panel]);
  const groupLinks = (group: typeof GROUPS[number]) => group.links.map(link => (
    <Link key={link.href} href={link.href} onClick={close} className="nav-destination" aria-current={isCurrent(link.href) ? "page" : undefined}>
      <span><strong>{link.label}</strong><span className="nav-description">{link.description}</span></span><span className="nav-destination-arrow" aria-hidden>↗</span>
    </Link>
  ));
  return (
    <header ref={header} className="site-header" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close(); }}>
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <div className="site-width header-inner">
        <Link href="/" className="brand" aria-label="Saint Discovery home" onClick={close}><span className="brand-mark" aria-hidden>✦</span><span className="brand-name">Saint Discovery</span></Link>
        <nav className="desktop-nav" aria-label="Main">
          <Link href="/saint-of-day" onClick={close} className="nav-link nav-today" aria-current={isCurrent("/saint-of-day") ? "page" : undefined}><span className="nav-today-dot" aria-hidden />Saint of the day</Link>
          {GROUPS.map(group => <div className="nav-group" key={group.id} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPanel(current => current === group.id ? null : current); }}>
            <button className="nav-link nav-disclosure" data-active={group.links.some(link => isCurrent(link.href)) || (group.id === "saints" && pathname.startsWith("/saints/")) || undefined} aria-expanded={panel === group.id} aria-controls={`nav-${group.id}`} onClick={event => { panelToggle.current = event.currentTarget; setPanel(panel === group.id ? null : group.id); }}>{group.label}<Chevron /></button>
            <div id={`nav-${group.id}`} className="nav-panel" hidden={panel !== group.id}><p className="nav-group-label">{group.label}</p>{groupLinks(group)}</div>
          </div>)}
          <Link href="/blog" onClick={close} className="nav-link" aria-current={isCurrent("/blog") ? "page" : undefined}>Blog</Link>
          <span className="nav-divider" aria-hidden />
          <Link href="/quiz" className="btn-primary header-quiz" aria-current={isCurrent("/quiz") ? "page" : undefined}>Take the quiz <span aria-hidden>↗</span></Link>
        </nav>
        <div className="header-mobile-actions"><Link href="/quiz" onClick={close} className="btn-primary header-quiz" aria-current={isCurrent("/quiz") ? "page" : undefined}>Take the quiz <span aria-hidden>↗</span></Link>
        <button ref={toggle} className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d={open ? "M6 6l12 12M6 18L18 6" : "M4 8h16M4 16h16"} /></svg></button></div>
      </div>
      <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile" hidden={!open}>
        <div className="mobile-nav-inner"><div className="mobile-nav-shortcuts"><Link href="/saint-of-day" onClick={close} className="nav-link nav-today" aria-current={isCurrent("/saint-of-day") ? "page" : undefined}><span className="nav-today-dot" aria-hidden />Saint of the day</Link><Link href="/blog" onClick={close} className="nav-link" aria-current={isCurrent("/blog") ? "page" : undefined}>Blog <span aria-hidden>↗</span></Link></div>
        {GROUPS.map(group => <section className="mobile-nav-group" key={group.id} aria-labelledby={`mobile-${group.id}`}><h2 id={`mobile-${group.id}`} className="nav-group-label">{group.label}</h2>{groupLinks(group)}</section>)}</div>
      </nav>
    </header>
  );
}
