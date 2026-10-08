# API Routes Documentation

All routes are prefixed with `/api` (configured in `src/main.ts`). Interactive docs: http://localhost:8200/docs

Responses are wrapped as `{ "success": true, "message": "Success", "data": ... }`; errors as `{ "success": false, "message": "..." }`.

Lists return `data: { items, total, page, limit, totalPages }`. Content lists default to `limit=100` (max 100), so a client that omits `?limit=` gets the whole list.

## 🔓 Public routes (no token)

### Travel content (read)
| Method | Endpoint | Query | Returns |
|--------|----------|-------|---------|
| GET | `/api/provinces` | `interest`, `page`, `limit` | Province cards |
| GET | `/api/provinces/:slug` | | Full province page (`topPlaces`, `gettingThere`, `bestSeason`, `sampleBudget`, `planSlug`, …) |
| GET | `/api/upcoming-provinces` | `interest` | "Coming soon" teasers |
| GET | `/api/foods` | `province`, `type`, `page`, `limit` | Food cards |
| GET | `/api/foods/:slug` | | Full food page + `provinces[]` + `related[]` (≤3) |
| GET | `/api/hidden-places` | `province`, `category`, `page`, `limit` | Place cards (`image` = cover) |
| GET | `/api/hidden-places/:slug` | | Full place page + `images[]` + `related[]` (≤3, same province) |
| GET | `/api/budget-plans` | `province`, `page`, `limit` | Plan cards with `total` |
| GET | `/api/budget-plans/:slug` | | Plan with `costs`, `categoryTotals`, `total`, `outline`, `tips` |

`interest`: temples · beaches · nature · city · food · culture. `type`: dish · street · spot. `category`: nature · business · experience. `province` is a province slug.

### Visitor forms (rate limited: 5 / minute / IP)
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/newsletter/subscribe` | `{ email }` → `{ subscribed: true }` (idempotent) |
| POST | `/api/contact-messages` | `{ name, email, message }` → `{ received: true }` |

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (gets the Customer role) |
| POST | `/api/auth/login` | Login → access + refresh token |
| POST | `/api/auth/refresh` | Rotate a refresh token |
| POST | `/api/auth/logout` | Revoke a refresh token |

---

## 🔒 Protected routes

Send `Authorization: Bearer <accessToken>`. Permissions are carried in the JWT; after changing a role's permissions, users must log in again (or refresh) to pick them up.

### Authentication profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Authenticated user profile |

### Travel content (write)
| Method | Endpoint | Permission |
|--------|----------|------------|
| POST | `/api/provinces` | `provinces:write` |
| PATCH | `/api/provinces/:slug` | `provinces:write` |
| DELETE | `/api/provinces/:slug` | `provinces:delete` (409 while places/plans use it) |
| POST / PATCH `:id` | `/api/upcoming-provinces` | `provinces:write` |
| DELETE | `/api/upcoming-provinces/:id` | `provinces:delete` |
| POST / PATCH `:slug` | `/api/foods` | `foods:write` |
| DELETE | `/api/foods/:slug` | `foods:delete` |
| POST / PATCH `:slug` | `/api/hidden-places` | `places:write` |
| DELETE | `/api/hidden-places/:slug` | `places:delete` |
| POST / PATCH `:slug` | `/api/budget-plans` | `plans:write` |
| DELETE | `/api/budget-plans/:slug` | `plans:delete` |

Write bodies mirror the read shapes (see Swagger). Relations are by slug (`"province": "kampot"`, `"provinces": ["kampot", "siem-reap"]`). On PATCH, any child collection you send replaces the whole collection.

### Visitor inbox
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/contact-messages` (`unread=true`) | `messages:read` |
| PATCH | `/api/contact-messages/:id/read` | `messages:write` |
| DELETE | `/api/contact-messages/:id` | `messages:delete` |
| GET | `/api/newsletter/subscribers` | `subscribers:read` |
| DELETE | `/api/newsletter/subscribers/:id` | `subscribers:delete` |

### Media (image uploads)
| Method | Endpoint | Permission |
|--------|----------|------------|
| POST | `/api/media/upload`, `/api/media/upload-multiple` | `media:write` |
| GET | `/api/media`, `/api/media/:id` | `media:read` |
| DELETE | `/api/media/:id` | `media:delete` |

### Users and roles (unchanged)
| Method | Endpoint | Permission |
|--------|----------|------------|
| POST | `/api/users` | `users:write` |
| GET | `/api/users`, `/api/users/:id` | `users:read` |
| PATCH | `/api/users/:id` | `users:write` |
| PATCH | `/api/users/:id/role` | `users:manage-roles` |
| DELETE | `/api/users/:id` | `users:delete` |
| POST / PATCH / DELETE | `/api/users/:id/profile-image` | `users:write` |
| GET | `/api/roles`, `/api/roles/:id` | `users:manage-roles` |

### Roles → permissions

| Role | Permissions |
|------|-------------|
| Admin | all 20 |
| Support | `users:read`, `users:write`, `provinces:write`, `foods:write`, `places:write`, `plans:write`, `messages:read`, `messages:write`, `subscribers:read`, `media:read`, `media:write` |
| Customer | none |

---

## 🧪 Testing routes

```bash
# Public read
curl http://localhost:8200/api/provinces
curl "http://localhost:8200/api/foods?province=kampot&type=street"

# Login, then write
curl -X POST http://localhost:8200/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

curl -X PATCH http://localhost:8200/api/foods/lok-lak \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"price":{"min":3,"max":8,"unit":{"en":"per plate"}}}'
```

Swagger JSON for Postman/Insomnia: http://localhost:8200/docs-json

## 📂 Finding routes in code

Every `@Controller('path')` + `@Get()/@Post()/…` combination is a route. Start at `src/app.module.ts` for the module list, then each module's controller:
`provinces`, `upcoming-provinces`, `foods`, `hidden-places`, `budget-plans`, `newsletter`, `contact-messages`, `media`, `users`, `roles`, `auth`.
