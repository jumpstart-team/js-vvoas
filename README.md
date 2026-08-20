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
css/tokens.v2.css          design tokens: colour, type, space, motion
css/fonts.v2.css           @font-face for the two self-hosted families
css/main.v2.css            everything else, referencing tokens by name
js/app.v2.js               nav, scroll reveals, appointment form, FAQ
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

Live at https://js-vvoas.vercel.app

### A note on caching, and why the files carry `.v2`

The first deploy served every asset `immutable, max-age=31536000` while the
filenames were not content-hashed. That is the wrong header for an
unversioned name, and it poisoned any browser that visited during that
window: those caches pinned `css/main.css` for a year and stopped
revalidating, so they went on pairing fresh HTML with year-old CSS.

The headers were corrected, but a corrected header cannot reach a cache that
has stopped asking. The only cure is a filename the poisoned cache has never
seen, which is why the CSS and JS carry a `.v2` infix.

Current policy: fonts stay `immutable` (a woff2 under a fixed name does not
change), CSS and JS revalidate, images get a day. Because CSS and JS
revalidate, editing them needs no further rename. Do not put `immutable`
back on an unhashed filename.

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

The current system is the practice's own brand, not an invented one. Two
colours were sampled from the pixels of the existing logo artwork:

- **Sage** `#8caeab`, `oklch(72.5% 0.0373 189.7)` — the upper chevron
- **Olive** `#544430`, `oklch(39.8% 0.0383 72.6)` — the lower chevron

plus `#3c3c3c` body ink, `#ecf1f3` pale wash and `#c40000` error from the old
stylesheet, and white as the ground.

Neither brand colour can carry text. `#8caeab` is 2.40:1 on white, and the old
site set every heading and link in `#9c9c9c` at 2.75:1, both well under the
4.5:1 floor. So the two logo colours are kept **exact** for marks and fills,
and the text steps are derived by darkening along the identical hue. The
identity is the hue, not the lightness.

- **Display** Newsreader
- **Body** Instrument Sans
- **Spacing** 4pt base unit
- **Type scale** 15 / 17 / 19 / 22 / 27 / 34 / 44 / 58 / 76 px, plus two
  fluid display sizes

All twenty-four foreground and background pairings were checked against
WCAG AA and all pass. The textured sedation band was checked a second way,
by sampling the rendered pixels underneath each block of text: the real
background there is `#312a1f`, giving between 8.4:1 and 13.2:1.

## Content notes

Everything factual on the page came from the existing site: both surgeons'
credentials and training, the twelve procedures, the six Google reviews, the
first-visit requirements, the payment methods, the address and the hours.

Nothing was invented. There are no fabricated statistics, no made-up review
counts and no claims about how fast someone can be seen, because none of
that was verifiable from the source.

### Images

Every photograph is the practice's own, taken from the current site and
re-encoded to webp.

| File | Source | Used for |
|---|---|---|
| `office.webp` | `home_banner/1.jpg` | The real reception, under the hero |
| `dr-charnowitz.webp` | `charnowitz.jpg` | Dr. Charnowitz's avatar |
| `texture-dark.webp` | `home_expertise/bg.jpg` | Texture behind the sedation band |
| `consult.webp` | `dr_awalt.jpg` | Clinical photo in the first-visit section |
| `baltimore.webp` | `home_parallax/1.jpg` | The greater-Baltimore band |
| `aaoms.webp`, `ada.webp` | `associations/` | Society membership marks |

The whole image set is under 500 KB.

The chevron in the nav and footer is the logo mark redrawn as inline SVG, in
the two exact brand colours, so it stays sharp at any size.

### Three things found in the source material

1. **There is no photograph of Dr. Awalt.** The file named `dr_awalt.jpg` on
   the current site is a stock image of a clinician showing an x-ray to a
   patient, not a portrait of her. It is used here as a clinical photo in the
   first-visit section, never captioned as her. Her avatar is a marked
   placeholder until the practice supplies a headshot.
2. **The logo artwork predates the rebrand.** It reads "Bethany Serafin
   Awalt, DMD, PA." only, with no mention of Dr. Charnowitz. The original
   file is kept at `img/logo.png` for reference but is not used on the page;
   the footer carries the redrawn chevron and the practice name instead.
3. **The suite number disagrees with itself.** The logo says "Suites 103-104"
   while the site body text says "Suite 103". The page uses Suite 103,
   matching the body text. Worth confirming which is right.

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
