# Blog and writing studio

Routes: `/blog`, `/blog/[slug]`, `/admin/blog`, `/admin/blog/[id]`.

## InsForge storage

The migration `migrations/20260917010054_blog-post-storage.sql` is applied to Saint Discovery Quiz. `blog_posts` stores revision and lifecycle metadata; `blog_post_content` stores typed draft/published fields and rich-text document bodies. `blog_editors` is the private editor allowlist. The only authorized editor is the verified account `hello@saintdiscoveryquiz.com`.

The `blog_published_posts` view deliberately exposes only published snapshots of non-trashed posts. Private base tables have RLS enabled. Visitors have no draft or write grants. Authenticated accounts must be allowlisted. Saves go through an atomic revision-checked database function; stale edits fail rather than overwrite someone else's work. No sample posts were seeded into the live database.

## Signing in

Use **Continue with Google** and the Google Workspace account for `hello@saintdiscoveryquiz.com`. This backend runs InsForge 2.2.4 and does not provide the newer passwordless `/api/auth/email/send-otp` endpoint. Google OAuth is enabled and its initiation endpoint was verified. The server uses the SDK's PKCE exchange and session-cookie helpers. The refresh token stays httpOnly. Both application endpoints and database rules enforce editor access.

## Saving and recovery

Autosave coalesces changes after 600 ms and serializes writes. The UI reports saved only after InsForge confirms it. Publishing waits for the database save. Draft edits do not change an existing published snapshot. Trash and unpublish remove the reading view; restore brings a trashed publication back.

The old browser-only storage is preserved. **Import old browser drafts** copies custom, non-trashed posts as private drafts and skips demo samples or already imported IDs. Recovery copies are retained locally until a database save succeeds; **Export recovery copies** downloads them. Post and full-list JSON exports remain available. Imports do not automatically publish.

Images still use HTTPS URLs, bundled images, or small inline uploaded images (750 KB each). Dedicated media storage and a media library remain future work. The admin list currently returns the most recent 200 posts. Public browsing uses server-rendered pagination with 12 stories per page. Published articles have canonical metadata, BlogPosting/breadcrumb structured data, and dedicated sitemap/RSS routes. Admin, empty, and filtered search pages stay noindex; published articles and non-empty unfiltered blog pages are indexable. The blog is linked from the main/mobile navigation. Ad slots remain placeholders limited to the blog; no ad network is installed.

## Environment and release

Set these values in the deployment environment before releasing this work. They are configured locally in ignored `.env.local`:

- `INSFORGE_BLOG_URL`: linked backend URL.
- `INSFORGE_BLOG_ANON_KEY`: the InsForge anonymous client key, used by server routes with the editor's session.
- `NEXT_PUBLIC_INSFORGE_URL` and `NEXT_PUBLIC_INSFORGE_ANON_KEY`: public client configuration for best-effort quiz result logging.
- `INSFORGE_API_KEY`: **server-only** admin key used by existing email confirmation/unsubscribe routes; never use a `NEXT_PUBLIC_` prefix.

A pre-existing hardcoded key in `lib/insforge.ts` was confirmed to match the project admin key. This change removes it from source and separates the public quiz client from server-only administration. Because it already appeared in the deployed browser bundle and repository history, it must be rotated. Coordinate deployment of these environment variables and this client separation, then rotate the exposed key and update server consumers/CLI credentials. Do not consider private drafts secure on the live backend until the exposed key is revoked. This task has not rotated that key or deployed the site.

Before public launch: rotate the exposed key, deploy configuration and code, finish a user-approved public publishing test, add admin-list pagination and dedicated media storage, and choose an ad provider. Existing dependency audit findings remain separate release work.

Validation: Google OAuth sign-in completed, an authorized draft saved to InsForge and survived a full browser reload, anonymous draft reads and writes were denied, and the public API returned no draft. The temporary verification draft was moved to Trash. Live publication testing was blocked by automatic approval review; no test article was published. Automated tests cover publication snapshots, input validation, origin checks, autosave sequencing/coalescing, and save failures.

SEO validation: 40 unit tests, five existing site SEO checks, and one production HTTP integration suite passed. The HTTP suite uses an isolated local backend fixture and checks rendered article text, publication-only data access, metadata, pagination, noindex boundaries, 404 responses, RSS escaping, and sitemap failure responses. No fixture article was written to InsForge or published.
