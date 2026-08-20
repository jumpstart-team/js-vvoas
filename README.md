# Valley Village Oral Surgery Associates

Static marketing site for Valley Village Oral Surgery Associates, Pikesville MD.
Replaces `drbethanyawalt.com` under the practice's rebrand, now that
Dr. Neil Charnowitz has joined Dr. Bethany Serafin Awalt.

Currently: the home / landing page only. Interior pages come after the
aesthetic is signed off.

## Stack

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.
Push it and Vercel serves it.

```
index.html                 the whole landing page
css/tokens.css             design tokens: colour, type, space, motion
css/fonts.css              @font-face for the two self-hosted families
css/main.css               everything else, referencing tokens by name
js/main.js                 nav, scroll reveals, appointment form
fonts/                     Newsreader + Instrument Sans, latin subset, variable
vercel.json                clean URLs, cache and security headers
favicon.svg
robots.txt
```

## Running it locally

There is nothing to install.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Open `index.html` directly with `file://` and the CSS `@import` chain still
works, but the self-hosted fonts will not load. Use the server.

## Deploying

Import the repo at vercel.com. Framework preset **Other**, build command
empty, output directory empty. `vercel.json` handles the rest.

Once the new domain is chosen, three things need updating:

1. `index.html` — uncomment the `canonical` and `og:url` tags near the top
   and fill in the domain.
2. `robots.txt` — uncomment the `Sitemap:` line.
3. Point the domain at the Vercel project and set up a redirect from
   `drbethanyawalt.com` so the existing search ranking carries over.

## Wiring up the appointment form

The form validates fully and handles every state, but it does not have a
destination yet. `FORM_ENDPOINT` at the top of `js/main.js` is empty, so
submitting a valid form tells the visitor to call instead of pretending the
request went through.

Two ways to finish it:

**A form service.** Create an endpoint at Formspree, Basin, Web3Forms or
similar, then set the constant:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
```

The form POSTs JSON with the keys `firstName`, `lastName`, `phone`, `email`,
`reason` and `notes`.

**A Vercel function.** Add `api/appointment.js`, set `FORM_ENDPOINT` to
`/api/appointment`, and send the mail from there with Resend or SendGrid.
This keeps the API key server-side. Note that patient-submitted information
touches PHI territory, so whatever receives this data should be covered by a
BAA if the practice intends to accept clinical detail through it. The form
copy currently asks people not to send medical detail, which keeps the
exposure low.

## Rebranding or retheming

Every colour, font, size, space and easing lives in `css/tokens.css`.
`main.css` never hardcodes a value, it only references tokens by name. To
change the look, edit that one file.

The current system:

- **Paper** warm bone, `oklch(97.5% 0.008 85)`
- **Accent** deep pine, `oklch(38% 0.062 158)`, chosen to avoid the default
  healthcare blue
- **Display** Newsreader
- **Body** Instrument Sans
- **Spacing** 4pt base unit
- **Type scale** 15 / 17 / 19 / 22 / 27 / 34 / 44 / 58 / 76 px, plus two
  fluid display sizes

All twenty foreground and background pairings were checked against WCAG AA.
The lowest is the focus ring at 5.57:1 against a raised surface, which needs
3:1. Body text sits between 6.4:1 and 16.5:1.

## Content notes

Everything factual on the page came from the existing site: both surgeons'
credentials and training, the twelve procedures, the six Google reviews, the
first-visit requirements, the payment methods, the address and the hours.

Nothing was invented. There are no fabricated statistics, no made-up review
counts and no claims about how fast someone can be seen, because none of
that was verifiable from the source.

Two things still need the practice to supply them:

- **Headshots.** Both surgeon portraits are placeholders. Each one is a
  `<div class="surgeon__portrait">` with an HTML comment above it showing
  where the `<img>` goes. The frame styling carries over unchanged.
- **The form endpoint**, as above.

## Accessibility

- Skip link, landmarks, and a visible focus ring on every interactive element
- The focus ring is never animated, so it appears the instant focus lands
- Reduced motion is respected; spatial movement collapses to a short fade
- Scroll reveals are driven by `IntersectionObserver`, and the page renders
  fully with JavaScript disabled
- Body text is 17px, never below 15px, and form inputs are 17px so iOS Safari
  does not zoom on focus
- Verified with no horizontal scroll and no wrapped button labels at 320,
  375, 414, 768, 1024 and 1440px
