"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, XIcon } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const GROUPS = [
  { id: "guides", label: "Guides", links: [
    { href: "/resources/reading", label: "Guided reading", description: "Compare two lives and explore their sources." },
    { href: "/confirmation-saint-guide", label: "Confirmation guide", description: "Choose a saint to walk with you." },
    { href: "/resources/teachers", label: "Teachers & catechists", description: "Free worksheets and lesson resources." },
  ] },
];

type NavLink = { href: string; label: string; today?: boolean };

const PRIMARY_LINKS: NavLink[] = [
  { href: "/resources", label: "Saints directory" },
  { href: "/patron-saint-of", label: "Patron saints" },
];

const SHORTCUT_LINKS: NavLink[] = [
  { href: "/saint-of-day", label: "Saint of the day", today: true },
  { href: "/blog", label: "Blog" },
];

export default function SiteHeader() {
  // Vercel's root ISR function renders as /index, while the browser sees /.
  // Keep the first header render identical, including the language switcher.
  const route = usePathname();
  const pathname = route === "/index" ? "/" : route;
  // Remounting on navigation also resets any open menu.
  return <HeaderNavigation key={pathname} pathname={pathname} />;
}

function LinkLabel({ label, today }: { label: string; today?: boolean }) {
  return (
    <>
      {today && <span className="nav-today-dot" aria-hidden />}
      {label}
    </>
  );
}

function HeaderNavigation({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState("");
  const close = () => {
    setOpen(false);
    setPanel("");
  };
  const isCurrent = (href: string) =>
    pathname === href || (href !== "/resources" && pathname.startsWith(href + "/"));
  const isDirectory = (href: string) =>
    href === "/resources" && (isCurrent(href) || pathname.startsWith("/saints/"));
  const current = (active: boolean) => (active ? "page" as const : undefined);

  return (
    <header className={`site-header site-header-refresh${pathname === "/" ? " gallery-site-header" : ""}`}>
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <div className="site-width header-inner">
        <Link
          prefetch={false}
          href="/"
          className="brand notranslate"
          translate="no"
          lang="en"
          dir="ltr"
          aria-label="Saint Discovery home"
          onClick={close}
        >
          <span className="gallery-brand-mark" aria-hidden>✣</span>
          <span className="brand-name">Saint Discovery</span>
        </Link>

        <NavigationMenu
          className="desktop-nav"
          aria-label="Main"
          value={panel}
          onValueChange={setPanel}
        >
          <NavigationMenuList className="desktop-nav-list">
            {[...PRIMARY_LINKS, ...SHORTCUT_LINKS].map(link => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink active={link.href === "/resources" ? isDirectory(link.href) : isCurrent(link.href)} render={<Link
                    prefetch={false}
                    href={link.href}
                    onClick={close}
                    className={link.today ? "nav-link nav-today" : "nav-link"}
                  >
                    <LinkLabel label={link.label} today={link.today} />
                  </Link>} />
              </NavigationMenuItem>
            ))}
            {GROUPS.map(group => (
              <NavigationMenuItem key={group.id} value={group.id} className="nav-group">
                <NavigationMenuTrigger
                  className="nav-link nav-disclosure"
                  data-active={group.links.some(link => isCurrent(link.href)) || undefined}
                >
                  {group.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="nav-panel">
                  <p className="nav-group-label">{group.label}</p>
                  {group.links.map(link => (
                    <NavigationMenuLink key={link.href} active={isCurrent(link.href)} render={<Link prefetch={false} href={link.href} onClick={close} className="nav-destination">
                        <span>
                          <strong>{link.label}</strong>
                          <span className="nav-description">{link.description}</span>
                        </span>
                      </Link>} />
                  ))}
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
            <li className="nav-divider" aria-hidden />
            <NavigationMenuItem>
              <Button variant="gold" size="compact" nativeButton={false} render={<Link
                  prefetch={false}
                  href="/quiz"
                  className="btn-primary header-quiz"
                  aria-current={current(isCurrent("/quiz"))}
                >
                  Take the quiz
                </Link>} />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="header-tools">
          <LanguageSwitcher pathname={pathname} onOpen={close} />
          <div className="header-mobile-actions">
            <Button variant="gold" size="compact" nativeButton={false} render={<Link
                prefetch={false}
                href="/quiz"
                onClick={close}
                className="btn-primary header-quiz"
                aria-current={current(isCurrent("/quiz"))}
              >
                Take the quiz
              </Link>} />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger render={<button
                  type="button"
                  className="menu-toggle"
                  aria-controls="mobile-nav"
                  aria-label={open ? "Close menu" : "Explore Saint Discovery"}
                >
                  <span>Explore</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path d={open ? "M6 6l12 12M6 18L18 6" : "M4 8h16M4 16h16"} />
                  </svg>
                </button>} />
              <SheetContent
                id="mobile-nav"
                side="right"
                className="mobile-nav"
                showCloseButton={false}
                aria-modal="true"
                aria-describedby={undefined}
                onKeyDown={event => {
                  if (event.key !== "Tab") return;
                  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
                  const first = items[0];
                  const last = items[items.length - 1];
                  if (event.shiftKey && document.activeElement === first && last) {
                    event.preventDefault();
                    last.focus();
                  } else if (!event.shiftKey && document.activeElement === last && first) {
                    event.preventDefault();
                    first.focus();
                  }
                }}
              >
                <div className="mobile-nav-header">
                  <div>
                    <SheetTitle className="mobile-nav-title">Explore</SheetTitle>
                    <p className="mobile-nav-intro">Discover saints and resources for your journey.</p>
                  </div>
                  <SheetClose render={<Button variant="ghost" size="icon-lg" className="mobile-nav-close" aria-label="Close menu">
                      <XIcon aria-hidden />
                    </Button>} />
                </div>
                <nav className="mobile-nav-inner" aria-label="Mobile">
                  <Link
                    prefetch={false}
                    href="/quiz"
                    onClick={close}
                    className="mobile-menu-quiz"
                    aria-current={current(isCurrent("/quiz"))}
                  >
                    <span>
                      <strong>Take the quiz</strong>
                      <span>Discover a saint to inspire you.</span>
                    </span>
                    <ChevronRightIcon aria-hidden />
                  </Link>
                  <section className="mobile-nav-section" aria-labelledby="mobile-discover">
                    <h2 id="mobile-discover" className="mobile-nav-section-title">Discover</h2>
                    {[...PRIMARY_LINKS, ...SHORTCUT_LINKS].map(link => (
                      <Link
                        key={link.href}
                        prefetch={false}
                        href={link.href}
                        onClick={close}
                        className="mobile-nav-row"
                        aria-current={link.href === "/resources" && pathname.startsWith("/saints/")
                          ? "location"
                          : current(isCurrent(link.href))}
                      >
                        <strong>{link.label}</strong>
                        <ChevronRightIcon aria-hidden />
                      </Link>
                    ))}
                  </section>
                  {GROUPS.map(group => (
                    <section className="mobile-nav-section mobile-nav-guides" key={group.id} aria-labelledby={`mobile-${group.id}`}>
                      <h2 id={`mobile-${group.id}`} className="mobile-nav-section-title">{group.label}</h2>
                      {group.links.map(link => (
                        <Link
                          key={link.href}
                          prefetch={false}
                          href={link.href}
                          onClick={close}
                          className="mobile-nav-row"
                          aria-current={current(isCurrent(link.href))}
                        >
                          <span>
                            <strong>{link.label}</strong>
                            <span className="mobile-nav-description">{link.description}</span>
                          </span>
                          <ChevronRightIcon aria-hidden />
                        </Link>
                      ))}
                    </section>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
