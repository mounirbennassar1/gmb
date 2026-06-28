# Mahad Dahlan Clinic — Reviews (قيّم تجربتك)

An Arabic (RTL) "rate us" funnel for the clinic. A visitor leaves a star rating + review;
it is **saved to PostgreSQL** and the visitor is **handed off to Google's official
write-review page** so their review appears on the clinic's Google profile. A
password-protected admin dashboard lets staff view, publish, reply to, and manage reviews.

## ⚠️ Important: how the Google sync really works

**Google does not allow any app to post a review on a user's behalf.** Google's
Business Profile API can *read* and *reply* to reviews, but there is **no API to create
one** — this is deliberate anti-fraud protection. A review can only be submitted by a
signed-in Google user through Google's own UI.

So this app uses the standard, policy-compliant **review funnel**:

1. Visitor submits their rating + comment on the Arabic page.
2. We persist it to our database immediately (the clinic owns the data).
3. We open Google's official **write-review dialog** and copy the visitor's comment to
   their clipboard so they can paste + submit in one tap. If they're signed in, it
   appears on Google instantly.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **Tailwind v4**
- **Prisma 7** (new `prisma-client` generator + `@prisma/adapter-pg` driver adapter)
- **PostgreSQL** (local for dev, Neon for production)

## Local setup

```bash
# 1. Environment — copy and edit
cp .env.example .env
#   DATABASE_URL          -> postgresql://USER@localhost:5432/mahad_reviews
#   ADMIN_PASSWORD        -> your admin password
#   ADMIN_SESSION_SECRET  -> openssl rand -hex 32

# 2. Create the database + tables
createdb mahad_reviews      # if it doesn't exist
npx prisma db push          # creates the Review / Admin / Setting tables
npx prisma generate         # generates the client (also runs on build/install)

# 3. Run
npm run dev                 # http://localhost:3000
```

Pages:
- `/` — the Arabic rating page (public)
- `/admin` — the dashboard (redirects to `/admin/login`; sign in with `ADMIN_PASSWORD`)

## 🔑 Required: set your Google Place ID

The Google hand-off button only appears once the clinic's **Place ID** is configured.

1. Find it: <https://developers.google.com/maps/documentation/places/web-service/place-id>
   (search the clinic name on the Place ID Finder).
2. Sign in to `/admin` → **الإعدادات** (Settings) → paste it into **Google Place ID** → save.

Alternatively paste a full write-review URL into the optional field. Until one of these
is set, submissions are still saved — visitors just see a thank-you without the Google button.

## Deploy (Vercel + Neon)

1. Create a Neon Postgres database.
2. In Vercel project env vars, set:
   - `DATABASE_URL` → Neon **pooled** connection string (`...-pooler...?sslmode=require`)
   - `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
3. Once, against the Neon DB: `npx prisma db push` (creates the tables).
4. Deploy. `prisma generate` runs automatically via the `build` / `postinstall` scripts.

## Project structure

```
app/
  page.tsx               Arabic rating page (server component)
  RatingForm.tsx         Star picker + form + Google hand-off (client)
  admin/
    login/page.tsx       Password login
    page.tsx             Dashboard (auth-gated server component)
    AdminDashboard.tsx   Reviews management + settings (client)
  api/
    reviews/             POST a review; POST .../[id]/clicked (Google-click tracking)
    admin/               login, reviews list/patch/delete, settings  (all auth-gated)
lib/
  prisma.ts              PrismaClient singleton (pg adapter)
  auth.ts                Signed-cookie admin session (HMAC)
  config.ts              Settings (clinic name, Place ID, …) + write-review URL builder
prisma/schema.prisma     Review / Admin / Setting models
```

## Notes

- The `Admin` table exists in the schema but auth uses the single `ADMIN_PASSWORD` env
  var (per the "simple password" choice). It can later back a multi-user login.
- Reviews have statuses `new → approved → archived`; only `approved` show publicly on `/`.
