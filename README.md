# Padiush website

The public website of [Padiush](https://github.com/padiush/platform), the
ethnobotanical research platform: the landing page and About at
[padiushbio.com](https://padiushbio.com), in Spanish, English and Portuguese.

It is a static [Astro](https://astro.build) site, deployed on its own and
served from the same host as the platform, which keeps sign-in, the contact
form, the legal pages and the source-code notice. A change here never needs a
platform release. How the two share the domain is in
[docs/deployment.md](docs/deployment.md).

## Working on it

Node runs in a container, so the host needs only Docker:

```bash
docker compose run --rm node npm ci
docker compose run --rm node npm run build
docker compose up -d web
```

The built site is then at <http://127.0.0.1:4321>. Links to the platform's
pages (`/login`, `/contacto`, …) only resolve when the site sits behind the
same host as a running platform.

Before sending a change:

```bash
docker compose run --rm node npm run format:check
docker compose run --rm node npm run check
docker compose run --rm node npm test
```

## Where things are

- `src/i18n/` — every string, one file per language, and the page paths in each
  language. Spanish is written first; the other two keep the same keys.
- `src/views/` — the pages, shared by every language; `src/pages/` only binds
  each path to a view and a language.
- `src/components/` — header, footer, store badges, screenshots and the drawn
  field-app screen.
- `public/site/shots/` — platform screenshots, per language and theme, taken
  from the platform's example study by
  [scripts/capture-screenshots.mjs](scripts/capture-screenshots.mjs).
- `public/site/badges/` — Apple's App Store badges, unmodified, per language.

## Licence

The code is free software under the
[GNU Affero General Public License v3.0 or later](LICENSE), like the platform.
The Padiush name and logo, the team's photographs, and Apple's badge artwork
are not covered by that licence and may not be reused without permission.
