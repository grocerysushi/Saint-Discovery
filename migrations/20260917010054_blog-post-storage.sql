-- Private drafts and public publication snapshots for the writing studio.
CREATE TABLE public.blog_editors (
  email text PRIMARY KEY CHECK (email = lower(email))
);
ALTER TABLE public.blog_editors ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.blog_editors FROM anon, authenticated;
INSERT INTO public.blog_editors (email) VALUES ('hello@saintdiscoveryquiz.com');

CREATE FUNCTION public.is_blog_editor() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blog_editors e JOIN auth.users u ON lower(u.email) = e.email
    WHERE u.id = auth.uid() AND u.email_verified = true
  );
$$;
REVOKE ALL ON FUNCTION public.is_blog_editor() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_blog_editor() TO authenticated;

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY,
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  trashed boolean NOT NULL DEFAULT false
);
CREATE TABLE public.blog_post_content (
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  stage text NOT NULL CHECK (stage IN ('draft', 'published')),
  title text NOT NULL CHECK (length(title) <= 200),
  slug text NOT NULL CHECK (length(slug) <= 100),
  excerpt text NOT NULL CHECK (length(excerpt) <= 300),
  author text NOT NULL CHECK (length(author) <= 100),
  category text NOT NULL CHECK (length(category) <= 100),
  cover text NOT NULL CHECK (length(cover) <= 1100000),
  "coverAlt" text NOT NULL CHECK (length("coverAlt") <= 1000),
  "coverCredit" text NOT NULL CHECK (length("coverCredit") <= 1000),
  body jsonb NOT NULL CHECK (body->>'type' = 'doc' AND jsonb_typeof(body->'content') = 'array' AND octet_length(body::text) <= 2000000),
  ads boolean NOT NULL,
  PRIMARY KEY (post_id, stage),
  CHECK (stage <> 'published' OR (length(trim(title)) > 0 AND length(trim(author)) > 0 AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'))
);
CREATE UNIQUE INDEX blog_publication_slug ON public.blog_post_content(slug) WHERE stage = 'published';
CREATE INDEX blog_posts_updated ON public.blog_posts(updated_at DESC, id);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_content ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.blog_posts, public.blog_post_content FROM anon, authenticated;
GRANT SELECT ON public.blog_posts, public.blog_post_content TO authenticated;
CREATE POLICY blog_editor_read ON public.blog_posts FOR SELECT TO authenticated USING ((SELECT public.is_blog_editor()));
CREATE POLICY blog_editor_content_read ON public.blog_post_content FOR SELECT TO authenticated USING ((SELECT public.is_blog_editor()));

-- A deliberately projected, owner-executed view: never include the draft row.
CREATE VIEW public.blog_published_posts AS
SELECT p.id, p.revision, p.updated_at AS "updatedAt", p.published_at AS "publishedAt", false AS trashed,
       to_jsonb(c) - 'post_id' - 'stage' AS published,
       to_jsonb(c) - 'post_id' - 'stage' AS draft
FROM public.blog_posts p JOIN public.blog_post_content c ON c.post_id = p.id AND c.stage = 'published'
WHERE NOT p.trashed AND p.published_at IS NOT NULL;
REVOKE ALL ON public.blog_published_posts FROM anon, authenticated;
GRANT SELECT ON public.blog_published_posts TO anon, authenticated;

CREATE VIEW public.blog_editor_posts AS
SELECT p.id, p.revision, p.updated_at AS "updatedAt", p.published_at AS "publishedAt", p.trashed,
       to_jsonb(d) - 'post_id' - 'stage' AS draft,
       CASE WHEN c.post_id IS NULL THEN NULL ELSE to_jsonb(c) - 'post_id' - 'stage' END AS published
FROM public.blog_posts p JOIN public.blog_post_content d ON d.post_id = p.id AND d.stage = 'draft'
LEFT JOIN public.blog_post_content c ON c.post_id = p.id AND c.stage = 'published'
WHERE public.is_blog_editor();
REVOKE ALL ON public.blog_editor_posts FROM anon, authenticated;
GRANT SELECT ON public.blog_editor_posts TO authenticated;

-- All writes are atomic and revision-checked; direct client writes are denied.
CREATE FUNCTION public.save_blog_post(post jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  target uuid := (post->>'id')::uuid;
  expected integer := (post->>'revision')::integer;
  actual integer;
  stage_name text;
  item jsonb;
  result jsonb;
BEGIN
  IF NOT public.is_blog_editor() THEN RAISE EXCEPTION 'Blog editor access required' USING ERRCODE = '42501'; END IF;
  IF expected IS NULL OR expected < 0 OR octet_length(post::text) > 6500000 THEN RAISE EXCEPTION 'Invalid post'; END IF;
  IF expected = 0 THEN INSERT INTO public.blog_posts(id) VALUES (target) ON CONFLICT DO NOTHING; END IF;
  SELECT revision INTO actual FROM public.blog_posts WHERE id = target FOR UPDATE;
  IF actual IS NULL OR actual <> expected THEN RAISE EXCEPTION 'Post changed elsewhere. Export your writing and reload.' USING ERRCODE = '40001'; END IF;
  FOREACH stage_name IN ARRAY ARRAY['draft', 'published'] LOOP
    item := post->stage_name;
    IF item IS NULL OR item = 'null'::jsonb THEN
      IF stage_name = 'draft' THEN RAISE EXCEPTION 'Draft required'; END IF;
      DELETE FROM public.blog_post_content WHERE post_id = target AND stage = stage_name;
    ELSE
      INSERT INTO public.blog_post_content(post_id, stage, title, slug, excerpt, author, category, cover, "coverAlt", "coverCredit", body, ads)
      VALUES (target, stage_name, item->>'title', item->>'slug', item->>'excerpt', item->>'author', item->>'category', item->>'cover', item->>'coverAlt', item->>'coverCredit', item->'body', (item->>'ads')::boolean)
      ON CONFLICT (post_id, stage) DO UPDATE SET title=EXCLUDED.title, slug=EXCLUDED.slug, excerpt=EXCLUDED.excerpt, author=EXCLUDED.author, category=EXCLUDED.category, cover=EXCLUDED.cover, "coverAlt"=EXCLUDED."coverAlt", "coverCredit"=EXCLUDED."coverCredit", body=EXCLUDED.body, ads=EXCLUDED.ads;
    END IF;
  END LOOP;
  UPDATE public.blog_posts SET revision = revision + 1, updated_at = now(), trashed = (post->>'trashed')::boolean,
    published_at = CASE WHEN post->'published' IS NULL OR post->'published' = 'null'::jsonb THEN NULL ELSE coalesce(published_at, now()) END
  WHERE id = target;
  SELECT to_jsonb(v) INTO result FROM public.blog_editor_posts v WHERE v.id = target;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.save_blog_post(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_blog_post(jsonb) TO authenticated;
