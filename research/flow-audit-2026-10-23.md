# Reader flow audit — October 23, 2026

Scope: live homepage navigation, blog index and article, shared Francis result and its biography; source review of personal-result next steps; local desktop/mobile verification of the Blog rename. This is a sampled reader-flow review, not a crawl of every page or a new end-to-end email delivery test.

## Implemented

- Standardized the publication name from Journal to Blog in desktop navigation, footer, blog reader, search placeholder, pagination accessibility label, About/editorial copy, metadata, structured data, RSS title/error text, and writing-studio messages.
- Kept /blog and all existing article/feed URLs intact.
- Removed the duplicate mobile Blog link under Guides; the direct mobile Blog shortcut remains.
- Preserved historical references to personal journals and named publications in biography content.
- No AdSense settings or suitability restrictions changed.

## Remaining opportunities

1. Medium: desktop Blog discovery takes an extra menu step. It is under Guides, while mobile has a direct Blog shortcut. Consider a direct desktop Blog link, checking the header at intermediate widths before adding it.
2. Medium: topic-based reading paths on /blog appear after twelve article cards and pagination. Add a compact entry near the top pointing to these paths, or move a compact version above the chronological grid. This would help visitors arriving with a Confirmation, prayer, or teaching question.
3. Low: long biographies provide a table of contents, but onward reading and quiz calls to action require substantial scrolling. Francis already has a useful Canticle link in its early quick answers. Use similarly relevant early links on other biographies where editorially appropriate, rather than adding generic calls to action throughout.

## Working paths observed

- Homepage clearly offers quiz, directory search, daily saint, and two introductory blog articles.
- Guides → blog → article resolves successfully; articles offer a Blog breadcrumb, table of contents, and return-to-blog link.
- Shared result → Francis biography resolves successfully, with relevant Franciscan blog recommendations on both pages.
- Shared results clearly distinguish the shared saint from the visitor's own quiz result and offer a primary quiz action.
- Local mobile menu has one Blog destination and closes after selecting it.
- Blog browse/filter URL helpers and publication checks passed the existing automated tests. The initial sandbox run could not reach its local HTTP fixture; the fixture tests passed when rerun with local networking allowed.

Validation: 23 selected existing tests passed across the main run and fixture retry; ESLint on edited source files and git diff --check passed. Local Blog rendered the new title, search placeholder, footer and mobile menu at 390px. No production deployment was performed for this request.

## Authorized follow-up

Added the direct desktop Blog destination and moved the reading paths immediately after the featured article, before the remaining article grid. These two medium-priority recommendations are resolved. Filtered searches and later pages continue to omit the introductory paths. Production build, TypeScript and 10 focused tests passed; ESLint passed. Browser checks at 1181px (desktop breakpoint), 1040px, and 390px confirmed usable navigation and no mobile horizontal overflow. AdSense suitability controls were not changed.
