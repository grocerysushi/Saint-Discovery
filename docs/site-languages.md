# Public website languages

The header language button offers English plus 32 automatic Google translation options. Spanish, German and French are prominent based on [the October 12 Analytics review](../research/analytics/2026-10-12-language-priorities.md). Native names remain readable because the menu uses `translate="no"`. The menu uses a disclosure button, normal links and a native More languages disclosure; Escape, outside click and focus leaving close it. It fits compact mobile headers, with the quiz link available in the mobile navigation at the smallest widths.

## How it works

`lib/site-languages.ts` owns the language list and fixed allowed original/proxy hosts. Choosing a language sends only an allowlisted public pathname to Google's documented website translation service. It removes all initial query strings/fragments, including tokens. No provider script or request is loaded merely by opening the menu. English returns to the canonical original site. There are no new dependencies, database changes or paid translation API requirements.

Google serves the translated view on `www-saintdiscoveryquiz-com.translate.goog`. React/Next navigation otherwise drops the provider parameters, causing Google's “Can't translate this page” message. On that host only, the switcher intercepts ordinary public links and GET search forms for document navigation with language parameters. Directory filter history updates retain those parameters. Only recognized directory/blog search/filter keys are preserved; arbitrary query parameters and fragments are discarded. External links keep their existing behavior. Nonpublic internal destinations return to the original host.

Admin, API, subscription, confirmation and unsubscribe pages have no language menu. The translated email component presents a link to the English quiz instead of submitting email addresses through the translation proxy. That opens a separate tab and requires completing the original quiz there; quiz state is origin-specific. Other result/quiz session state belongs to the translated origin while using that view. No translation cookies or persistent preference are added on the original site; the proxy remembers its language in tab session storage when available.

## Editorial and measurement limits

These are automatic translations and may get saint names, prayers or Catholic terminology wrong. English remains the editorial original. Google can be unavailable by region, block a page, or change its service. The product discloses the provider, automatic wording and English-only email flow. This is reading accessibility, not maintained localization: no locale routes, translated canonical/hreflang tags, translated sitemap or localized email campaign are claimed. A future native implementation should use reviewed translations, language URLs, language-aware metadata and locale-specific Scripture sources.

`language_select` sends `selected_language` and `translation_method` through the existing consent/hostname-aware Analytics helper. Existing privacy rules remain intact. The proxy is excluded by the existing production hostname allowlist. No GA custom dimension was created during implementation; register `selected_language` separately to use it in standard custom reports. The GA built-in `language` dimension continues to describe the browser/device setting.

## Verification

- Unit coverage: supported destinations, fixed origins, token stripping, private-route rejection, public filter preservation, document link/form navigation, modified-click behavior and unchanged English email behavior; translated email requests are blocked. All 20 targeted language/email/directory-URL tests passed.
- Existing full suite: 141/143 passed inside the sandbox. The two local HTTP fixture failures passed on an unsandboxed rerun of all three blog-public tests.
- ESLint for changed TypeScript/TSX passes. The optimized production build passed, including TypeScript and generation of 904 static pages.
- Browser: native-name menu, additional languages, Escape, keyboard focus, mobile quiz access, no horizontal overflow at 320px, and tablet/desktop menu layout.
- Google's existing production view was tested in Spanish (home page, gender selection and the next dynamic quiz question), German (Joseph biography) and French (holy-water article heading). The local confirmation page has no language button. No production quiz completion or email submission was performed.
- The new proxy-navigation handlers require a post-deployment smoke check because Google's public service cannot fetch localhost. After deployment: switch Spanish → directory → filter/search → biography → quiz → answer/back/exit; repeat a French/German reading page, then return to English. Check email requests open the canonical English quiz, and confirm no translated duplicate GA page views. This local implementation has not been deployed.

Desktop preview: [screenshot](../research/languages-2026-10-12/desktop.png).
