# The Hungry & Thirsty Hippo: guest review platform concept

A mobile-first guest feedback platform for **The Hungry & Thirsty Hippo**, a guest house and restaurant in Karagita, Naivasha. Guests scan a QR code, tap the services they used, rate them with five big faces, pick what they liked and what to improve, and submit, usually in 30 to 60 seconds with no typing. Management gets a dashboard with moderation, responses, exports, analytics and printable QR codes.

Palette: deep forest green, champagne gold, ivory and charcoal, with the hippo logo and script wordmark from the business's own menu.

**Stack:** React 19 · Vite 7 · TypeScript · Tailwind CSS v4 · React Router 7 · Lucide React · Recharts · React Hook Form + Zod · qrcode. Frontend only: reviews are stored in the browser's `localStorage` (see "Going live" for the backend).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build (writes sitemap.xml and robots.txt)
npm run preview
```

Admin: `/admin`, demo passcode `hippo2026` (set in `siteConfig.ts`).

## Pages

| Route | Page |
|---|---|
| `/` | Landing: hero "How Was Your Experience?", Leave a Review / Explore Our Services, welcome message, how it works, services (tap to review) |
| `/review` | Step-by-step review: services → overall face rating → one screen per selected service → general experience → "what went wrong" (if any rating is 1-2) or "what made it special" (if 5) → enjoyed most → could improve + optional comment → optional guest details → summary with Edit links → thank-you screen with confetti |
| `/review/:slug` | QR entry: preselects the service. Slugs: `reception`, `rooms`, `restaurant`, `drinks` (plus `pool`, `events`, `spa`, `outdoors` if those services are switched on). Aliases: `room`, `dining`, `bar`, `conference` |
| `/services` | Services, amenities and the full menu from the PDF |
| `/admin` | Overview: total, average, today / this week / this month, positive %, weekly trend, lowest-rated areas, most-requested improvements, unresolved low ratings |
| `/admin/reviews` | All submissions: search and filter by date range, service, rating, resolved / unresolved; mark resolved; save a response (and email it to the guest if they left an address); export the filtered list to CSV or a print-ready PDF report |
| `/admin/analytics` | Cleanliness, staff, food quality, service delivery and value scores; satisfaction trend and volume; satisfaction by service; per-question breakdown per service; top likes, improvement requests, low-rating reasons and 5-star highlights. 30 / 90 day / all-time ranges |
| `/admin/qr` | Printable QR table cards for each location, with PNG download and "Print all" |
| `/photo-credits` | Photo credits |

## UX details

- Nothing is compulsory except choosing a service and an overall rating. Every comment box is optional, and steps without a selection show **Skip**.
- Progress bar with five labelled phases; Back / Continue on a fixed bottom bar; every answer can be changed from the summary.
- Large touch targets (56px faces), arrow-key support on rating groups, `aria-pressed` / `role="radio"` throughout, visible focus rings, reduced-motion support.
- The draft survives a page refresh (`sessionStorage`). Double taps on Submit are blocked, and an identical review sent again within 30 minutes is ignored.
- Email and phone are validated only if entered. Reviews are for management only: nothing guests submit is shown on the public site.

## Where to edit

| What | File |
|---|---|
| Name, contacts, location, check-in times, **which services are offered**, sample data on/off, admin passcode, demo banner | `siteConfig.ts` |
| Services, rating questions, analytics themes, QR locations | `src/data/services.ts` |
| Enjoyed / improve / "what went wrong" / "what made it special" options | `src/data/feedback.ts` |
| Menu (transcribed from the PDF) | `src/data/menu.ts` |
| Sample reviews generator | `src/data/sampleReviews.ts` |
| Storage (swap for an API here) | `src/lib/store.ts` |
| Colours and fonts | `src/index.css` (`@theme`) |

**Adding services:** booking listings say the property has no pool or spa, so `events`, `pool`, `spa` and `outdoor` are switched off in `siteConfig.offered`. Their questions are already written. Set any of them to `true` and it appears in the review flow, the home page, the filters, the analytics and the QR codes.

## Honesty rules

This is a pitch to a real business, so nothing is invented:

- **Sources.** Name, logo and menu come from the business's own menu PDF (October 2026). Location, 10 rooms, Wi-Fi, parking, breakfast hours, check-in/out and the phone number come from public booking listings (Trip.com, Expedia, Hotels.com). These can be out of date, so they show a **TO CONFIRM** label.
- **Any text containing `(confirm)` shows a visible TO CONFIRM label.** Remove the marker once the business confirms the detail.
- **Reviews are sample data.** The 68 seeded reviews are generated by `src/data/sampleReviews.ts`. They are not real guests. Every one is tagged **Sample** in the dashboard and in exports, and the dashboard and demo banner say so. Set `sampleReviews: false`, or use "Clear sample reviews" in the dashboard.
- **No star classification, awards or years** are claimed.
- **Photos** are openly licensed (CC0, public domain, CC BY-SA) from Wikimedia Commons and credited at `/photo-credits` (`public/images/credits.json`). None of them show the property, and the menu photos are labelled "Illustrative photo".
- **The admin passcode is a demo gate**, not real security. See below.

## Going live

1. Set `demoBanner.enabled` to `false` in `siteConfig.ts`. This removes the banner and the `noindex` tag, and `robots.txt` then allows indexing (except `/admin`).
2. Set `sampleReviews: false` and resolve every TO CONFIRM label.
3. Replace the photography with the property's own photos.
4. **Add a backend.** `localStorage` keeps reviews on one device only, so a shared dashboard needs a server. The suggested setup is Django REST Framework + MySQL with:
   - `POST /api/reviews` (public, rate-limited, with an idempotency key for duplicate protection)
   - `GET/PATCH /api/admin/reviews`, `/api/admin/stats` (JWT auth, roles such as manager / staff, audit log)

   Then replace the functions in `src/lib/store.ts`. Nothing else talks to storage.
5. Set `VITE_SITE_URL` to the live domain, then print the QR codes from `/admin/qr` (check the address field first).

## Deploy

**GitHub:** create an empty repo named `hungry-thirsty-hippo`, then:

```bash
git init && git add . && git commit -m "The Hungry & Thirsty Hippo guest review platform concept"
git branch -M main
git remote add origin https://github.com/<you>/hungry-thirsty-hippo.git
git push -u origin main
```

**Vercel:** import the repo. The framework preset is Vite, the build command is `npm run build` and the output directory is `dist`. `vercel.json` rewrites routes to `index.html` (so QR links like `/review/rooms` work), and `public/_redirects` does the same on Netlify. Add the `VITE_SITE_URL` environment variable.
