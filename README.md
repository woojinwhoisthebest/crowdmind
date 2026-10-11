# CrowdMind — global poll game MVP

This project contains:
- A responsive English-language website
- Community feed and poll creation form
- Votes and report button
- Cloudflare Pages Functions API
- Cloudflare D1 database schema

## Important status

The front-end works in demo mode when opened as a local file. In demo mode, newly created polls and votes are saved only in that browser and are NOT shared with other people.

To enable global shared polls, deploy the project to Cloudflare Pages and attach a D1 database. The project is not publicly online until you complete these account steps.

## Deploy (free tier may be enough for an early test)

1. Create a Cloudflare account. Since you are under 18, check the service's current eligibility rules and ask a parent/guardian to help with account setup if needed.
2. Create a D1 database named `crowdmind`.
3. Open the D1 SQL console and run all the SQL in `schema.sql`.
4. Create a GitHub repository and upload this project's files (keep `index.html`, `schema.sql`, and the `functions/` folder at the project root).
5. In Cloudflare Pages, create a project connected to that repository.
   - Build command: `exit 0`
   - Build output directory: `.`
6. In the Pages project settings, add a D1 database binding:
   - Variable name / binding: `DB`
   - Choose the D1 database you created.
7. Redeploy and open the provided `*.pages.dev` URL. The right panel should say “Connected to community database”.
8. Test from two different browsers/devices: create a poll on one, refresh the other, then vote.

Official deployment guide: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
Cloudflare Pages supports static HTML and Pages Functions for server-side features.

## Safety and production limitations

This is an MVP, not a fully hardened public social network.
- Votes are limited by a browser-generated identifier; this is not strong anti-abuse protection.
- The included content filter is deliberately basic and will miss many harmful posts.
- Reports are stored, but there is no admin moderation dashboard yet.
- Before promoting this publicly, add moderation/review, rate limiting, stronger spam protection, clear community rules, and a way to remove abusive content.
- Don't collect full names, precise location, school, contact details, or other personal data. Keep nicknames optional.
- No AI API key or private secret is included in the browser.

## Project structure

- `index.html` — front-end app
- `functions/api/polls.js` — list and create polls
- `functions/api/vote.js` — vote endpoint
- `functions/api/report.js` — report endpoint
- `schema.sql` — database tables
