"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { track } from "@/lib/analytics";
import { isSupportedLanguage, isTranslationProxy, proxyNavigationUrl, publicTranslationUrl, SITE_LANGUAGES, SITE_ORIGIN, translatedPageUrl } from "@/lib/site-languages";
import { useTranslationProxy } from "@/lib/use-translation-proxy";

const subscribe = () => () => {};
function currentLanguage() {
  if (!isTranslationProxy(window.location.hostname)) return "en";
  const code = new URLSearchParams(window.location.search).get("_x_tr_tl");
  if (code && isSupportedLanguage(code)) return code;
  try {
    const saved = window.sessionStorage.getItem("sd:translation-language");
    if (saved && isSupportedLanguage(saved)) return saved;
  } catch { /* Translation works without browser storage. */ }
  return "en";
}

export default function LanguageSwitcher({ pathname, onOpen }: { pathname: string; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();
  const language = useSyncExternalStore(subscribe, currentLanguage, () => "en");
  const proxy = useTranslationProxy();
  const page = publicTranslationUrl(pathname);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); button.current?.focus(); }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!proxy || !isSupportedLanguage(language)) return;
    try { window.sessionStorage.setItem("sd:translation-language", language); } catch { /* optional */ }
    const navigate = (event: MouseEvent) => {
      const anchor = (event.target as Element)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.dataset.languageChoice || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const target = new URL(anchor.href, window.location.href);
      if (![window.location.origin, SITE_ORIGIN].includes(target.origin)) return;
      const destination = proxyNavigationUrl(target.href, language)
        ?? `${SITE_ORIGIN}${target.pathname}${target.search}${target.hash}`;
      // Stop Next's SPA handler; Google's translation parameters need to reach
      // the proxy on every document request. Modified clicks keep native behavior.
      anchor.href = destination;
      event.stopImmediatePropagation();
      if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && (!anchor.target || anchor.target === "_self")) {
        event.preventDefault();
        window.location.assign(destination);
      }
    };
    const search = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.method.toLowerCase() !== "get") return;
      const target = new URL(form.action, window.location.href);
      if (![window.location.origin, SITE_ORIGIN].includes(target.origin)) return;
      for (const [key, value] of new FormData(form)) {
        if (typeof value === "string") target.searchParams.set(key, value);
      }
      const destination = proxyNavigationUrl(target.href, language);
      if (!destination) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(destination);
    };
    document.addEventListener("click", navigate, true);
    document.addEventListener("auxclick", navigate, true);
    document.addEventListener("submit", search, true);
    return () => {
      document.removeEventListener("click", navigate, true);
      document.removeEventListener("auxclick", navigate, true);
      document.removeEventListener("submit", search, true);
    };
  }, [proxy, language]);

  if (!page) return null;
  const active = SITE_LANGUAGES.find(item => item.code === language);
  const link = (item: { code: string; name: string; english: string }) => <a
    key={item.code} href={translatedPageUrl(pathname, item.code)!}
    data-language-choice={item.code} hrefLang={item.code} rel="nofollow noreferrer"
    lang={item.code} aria-current={language === item.code ? "true" : undefined}
    onClick={event => {
      track("language_select", { selected_language: item.code, translation_method: item.code === "en" ? "original" : "google_translate" });
      if (item.code === "en") { event.preventDefault(); window.location.assign(page.href); }
      setOpen(false);
    }}
  ><span>{item.name}</span><small lang="en">{item.english}</small>{language === item.code && <span aria-hidden="true">✓</span>}</a>;

  return <div className="language-switcher notranslate" translate="no" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }}>
    <button type="button" className="language-toggle" ref={button}
      aria-label={`Language: ${active?.english ?? "English"}`} aria-expanded={open} aria-controls={id}
      onClick={() => { if (!open) onOpen(); setOpen(!open); }}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/></svg>
      <span className="language-toggle-label">{active?.name ?? "Language"}</span>
      <svg className="language-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div className="language-panel" id={id} hidden={!open}>
      <p className="language-heading">Choose your language</p>
      <p className="language-note">Automatic translation by Google. Wording may be imperfect. Email forms stay on the English site.</p>
      <div className="language-options">
        {link({ code: "en", name: "English", english: "Original" })}
        {SITE_LANGUAGES.slice(0, 3).map(link)}
        <details><summary>More languages</summary><div>{SITE_LANGUAGES.slice(3).map(link)}</div></details>
      </div>
      <p className="language-provider">Opens this public page in Google Translate. <a href="https://support.google.com/translate/answer/2534559" target="_blank" rel="noopener noreferrer">About translation ↗</a></p>
    </div>
  </div>;
}
