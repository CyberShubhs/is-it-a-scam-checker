# URL policy

Stable, readable URLs help both users and search engines. This is the policy
for scamchecker.app. Implemented by `src/lib/blogSlug.ts` (blog slugs) and the
page/route structure under `src/app/`.

## Patterns

| Content type        | Pattern                         | Example                                  |
| ------------------- | ------------------------------- | ---------------------------------------- |
| Evergreen guide     | `/guides/{short-topic-slug}`    | `/guides/is-this-website-legit`          |
| Tool page           | `/{primary-keyword}`            | `/scam-website-checker`                  |
| Country tool page   | `/{keyword}-{country}`          | `/scam-website-checker-uk`               |
| Report hub          | `/reports/{entity-type}`        | `/reports/phone-numbers`                 |
| Fresh scam alert    | `/blog/{date}-{topical-slug}`   | `/blog/2026-06-02-fake-bank-text-scam`   |

## Rules

1. **Evergreen / semi-evergreen content** (guides, tool pages, hubs) uses a
   short, readable slug. **No date prefix and no opaque hash suffix.**
2. **Fresh alerts** (`/blog/...`) keep a **date prefix** because they are
   genuinely time-sensitive, but they **no longer carry a random hash suffix**.
   A numeric disambiguator (`-2`, `-3`) is only added on an actual filename
   collision (see `buildCleanBlogSlug`).
3. **Never introduce redirect chains.** If a URL changes, add a single 301 from
   the old URL straight to the final destination in `next.config.ts`.
4. **Do not 404 indexed content.** When migrating an existing URL, add the 301
   before (or in the same commit as) the change.

## Migration notes

Blog posts published before 2026-06 still carry the legacy
`{date}-{slug}-{hash}` filename. They are **not** renamed (renaming would 404
indexed URLs); they keep working as-is. Only newly generated posts use the
clean format. If a specific legacy post is ever migrated to a clean slug, add a
301 from the old path to the new one in `next.config.ts`.
