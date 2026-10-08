# TvOrt Frontend Integration

The TvOrt site (`tv_ort_v2`, Next.js App Router, English + Khmer) currently reads hard-coded data from `lib/data/*.ts`. This API serves that same content. This document maps each page to its endpoints and lists where the API response differs from the frontend's current types.

Base URL: `http://localhost:8200/api` (set it as an env var, e.g. `API_URL`, and add the site's origin to `CORS_ORIGIN` if you fetch from the browser; server components don't need CORS).

All **reads are public**. Only the admin/CMS side needs a token (`Authorization: Bearer …`).

## Localization

Text fields come back as `{ "en": "...", "kh": "..." }` (`kh` optional), exactly the frontend's `Text` object form, so `tx(value, locale)` from `lib/i18n.ts` works unchanged. Static UI copy (nav, labels, About page values) stays in `app/**/lang/*.json`; it is not content.

## Page → endpoints

| Page | Calls |
|---|---|
| `/` home | `GET /provinces`, `GET /foods?limit=6`, `GET /hidden-places?limit=3`, `GET /budget-plans?limit=3` |
| `/destinations` | `GET /provinces?interest=`, `GET /upcoming-provinces?interest=` |
| `/destinations/[slug]` | `GET /provinces/:slug`, `GET /foods?province=:slug&limit=3`, `GET /hidden-places?province=:slug`, and if `planSlug` is set `GET /budget-plans/:planSlug` |
| `/food` | `GET /foods?type=&province=` (province chips: `GET /provinces`) |
| `/food/[slug]` | `GET /foods/:slug` (already includes `provinces[]` and `related[]`) |
| `/beyond` | `GET /hidden-places?category=&province=` |
| `/beyond/[slug]` | `GET /hidden-places/:slug` (includes `related[]`) |
| `/budget-plans` | `GET /budget-plans` |
| `/budget-plans/[slug]` | `GET /budget-plans/:slug` |
| footer | `GET /provinces` |
| newsletter / contact forms | `POST /newsletter/subscribe`, `POST /contact-messages` (replace the `console.info` stubs in `lib/actions.ts`) |

`404` from a `:slug` endpoint → call `notFound()`.

## Differences from the current `lib/data/types.ts`

Cards and details are separate shapes (lists don't ship whole pages):

| Frontend today | API |
|---|---|
| `Province.planSlug?` | same; `plan` totals via `GET /budget-plans/:planSlug` |
| `Province.sampleBudget` `{stay,food,transport,activities,note}` | adds `total` |
| `Food.provinces: ProvinceSlug[]` | detail: `provinces: {slug, name}[]` (no extra lookup needed); cards omit it, filter with `?province=` |
| `HiddenPlace.images[]` | detail: `images[]`; cards: `image` (cover) and `province: {slug, name}` |
| `BudgetPlan` `planTotal()` / `categoryTotal()` | API returns `total` (cards and detail) and `categoryTotals` (detail); `costs` is grouped by category as before |
| `BudgetPlan.province` (slug) | `province: {slug, name}` |
| `foods.filter(...)`, `hiddenPlaces.filter(...)` in pages | server-side via query params |
| `related` / `more` computed in pages | `related[]` on food and place details |

`Photo` stays a string. Today those are Unsplash ids; an uploaded image is a path like `/uploads/media/...` served by the API. `lib/image-loader.ts` returns paths starting with `/` unchanged, which would resolve against the **site**, not the API. Before using uploads, prefix them with the API origin (or add the API host to the loader).

## Suggested wiring

1. Add `lib/api.ts`: a small `fetch` wrapper that reads `API_URL`, unwraps `{ data }`, and returns `null` on 404.
2. Replace each `lib/data/*.ts` import in the pages above with calls to it. Keep `lib/data/types.ts` but split `Province`, `Food`, `HiddenPlace`, `BudgetPlan` into `*Summary` (cards) and full types per the table above.
3. Caching: content changes rarely, so use `fetch(url, { next: { revalidate: 60 } })` (or tag-based revalidation) rather than dynamic rendering for every request. Check `node_modules/next/dist/docs/` for this Next version's caching API first.
4. Delete `lib/data/{provinces,food,places,plans}.ts` once every page reads from the API. `prisma/seed-data/content.json` already holds a copy.

## Admin / CMS (when you build it)

- `POST /auth/login` → `accessToken` (+ `refreshToken`); `GET /auth/me` for the role. Keep the access token in memory and the refresh token in an httpOnly cookie handled by your server.
- Create/update bodies mirror the read shapes; relations use slugs. Sending a child list on update (`topPlaces`, `whereToTry`, `costs`, `outline`, …) **replaces** that list.
- Validation errors are `400` with the messages joined in `message`; duplicate slug `409`; unknown province slug `400`; deleting a province that still has places/plans `409`.
- Image upload: `POST /media/upload` (multipart, field `file`) → returns `url`; store that string in the content's `image` field.

## Not in the API (by design, for now)

Draft/published state, soft delete, Khmer-language full-text search, newsletter unsubscribe links and sending email. Everything written through the API is live immediately.
