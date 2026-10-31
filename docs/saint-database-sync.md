# Saint database ID mappings

The public site builds saint biographies from reviewed repository data. The linked InsForge `public.saints` table is a separate mirror used for database references; it is not the editorial source of truth and does not determine quiz eligibility.

`lib/data/saint-db-ids.json` links canonical saint slugs to database UUIDs. The email confirmation endpoint uses this map when associating a signup with a saint. Keep existing UUIDs stable so existing references remain valid.

The October 3, 2026 additive database sync inserted 399 missing rows and retained the original 486 rows, including 60 legacy records outside the public catalog. The map therefore contains 885 entries for the 825 published saints plus the retained legacy entries. This code change adds the previously verified mappings; it performs no database writes or schema, authentication, or RLS changes.

On October 31, 2026, a fresh read-only query of `public.saints` confirmed that all 885 slug/UUID pairs match the proposed map. Comparison with main confirmed that all 486 original mappings remain unchanged. The directory regression test checks that each published saint has a valid, distinct UUID.

For a future sync, compare the current canonical directory with a fresh database snapshot first. Preserve existing IDs and records. Review any missing-row import separately, verify actual table contents after applying it, and only then update the map. The original sync used UUIDv5 with the DNS namespace and canonical biography URL for new records; do not derive replacements for rows that already exist.

Local database snapshots, import payloads, publishing records, logs, and screenshots are not part of this release. Never commit credentials or signup data.
