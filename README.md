# Brightleaf Dental — clinic website

A four-page marketing site for a dental practice. Plain HTML, CSS and JavaScript —
no build step, no dependencies, no framework. Open a file or drop the folder on any
static host.

> **All content is placeholder.** The clinic name, address, phone number, prices,
> staff and reviews are invented. See [Replacing the placeholders](#replacing-the-placeholders)
> before this goes anywhere public — publishing invented prices or reviews as if they
> were real would be misleading.

## Files

```
index.html      Home — hero, stats, service overview, why-us, first-visit steps, reviews
services.html   Treatment areas with self-pay price tables, payment options, FAQ
about.html      Practice story, standards, team cards, equipment
contact.html    Booking form, practice details, opening hours, map placeholder, FAQ
css/styles.css  Single stylesheet — design tokens at the top
js/main.js      Nav, sticky header, scroll reveals, hours highlight, form validation
```

## Running it

Double-click `index.html` — everything works from `file://`.

To serve it over HTTP (closer to production, needed if you add `fetch` calls):

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173.

## Replacing the placeholders

Find-and-replace across all four `.html` files:

| Placeholder | Occurrences |
| --- | --- |
| `Brightleaf Dental` | brand, footer, page titles, meta descriptions |
| `Riverside · Est. 2009` | brand sub-label |
| `128 Willow Street` / `Riverside, CA 92501` | header-adjacent footer + contact page |
| `(555) 014-2200` and `tel:+15550142200` | header, footer, CTAs, emergency card |
| `hello@brightleafdental.example` | footer, contact page |

Also review:

- **Prices** — every figure in `services.html` is fictional.
- **Reviews** — the three quotes on `index.html` and the hero quote are fictional.
- **Team** — names, credentials and years in `about.html` are fictional. Swap the
  initial-avatars (`<span class="avatar">EA</span>`) for real photos when you have them:
  replace with `<img class="avatar" src="…" alt="Dr …">` and the CSS already sizes it.
- **Stats** — the `<dl class="stats">` blocks on `index.html` and `about.html`.
- **Social links** — the footer `<a href="#">` placeholders.
- **Legal links** — privacy policy, accessibility statement and patient forms in the
  footer are `#` stubs.

## Branding

All colour, type, spacing and shape values are CSS custom properties in the
`:root` block at the top of `css/styles.css`. Changing the brand is a handful of
lines:

```css
--teal-600: #12857c;   /* primary — buttons, links, icons */
--teal-700: #0f6b64;   /* primary hover, headings on tint */
--teal-900: #06302c;   /* dark panels, footer */
--coral-500: #ff7a59;  /* accent — booking CTAs only */
```

Fonts load from Google Fonts (Fraunces for display, Plus Jakarta Sans for body) and
fall back to system fonts if the request fails. To self-host, drop the `<link>` tags
and point `--font-display` / `--font-body` at your own `@font-face` rules.

## The booking form

`js/main.js` validates the form client-side and then **simulates** a successful
submission — nothing is sent anywhere. Wire it to a real endpoint by replacing the
`setTimeout` block in `initForm()`:

```js
fetch("/api/appointment-request", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(Object.fromEntries(new FormData(form)))
})
  .then(function (res) {
    if (!res.ok) throw new Error("Request failed");
    form.reset();
    showStatus(status, "ok", "Thanks! Your request is in.");
  })
  .catch(function () {
    showStatus(status, "err", "Something went wrong — please call us instead.");
  })
  .finally(function () {
    submit.disabled = false;
    submit.textContent = original;
  });
```

Two things to sort out before taking real patient enquiries:

1. **Server-side validation.** The client-side rules are a convenience, not a
   defence. Validate again on the server.
2. **Health data.** The form deliberately asks people *not* to send insurance IDs or
   medical history, because a plain form post is the wrong channel for it. If you
   need that information, collect it through a HIPAA-compliant intake system.

Links from the services page prefill the treatment dropdown via a query string —
`contact.html?service=Clear%20aligners#book`. The values must match the `<option>`
values in `contact.html` exactly.

## The map

`contact.html` ships a CSS-drawn placeholder map. Swap the whole
`<div class="map-embed">` for a real embed:

```html
<div class="map-embed">
  <iframe
    title="Map showing the clinic location"
    src="https://www.google.com/maps/embed?pb=YOUR_EMBED_ID"
    style="position:absolute;inset:0;width:100%;height:100%;border:0"
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"></iframe>
</div>
```

The `.map-embed` wrapper keeps the aspect ratio and rounded corners.

## Accessibility notes

Built in, worth preserving if you edit:

- Skip link to `#main` on every page; single `<h1>` per page; landmark elements.
- Mobile menu is a real `<button>` with `aria-expanded` / `aria-controls`, closes on
  Escape, and returns focus to the toggle.
- Visible 3px focus ring on every interactive element.
- Form errors use `role="alert"` and `aria-invalid`, and focus moves to the first
  invalid field on submit.
- Decorative SVGs are `aria-hidden`; meaningful ones have labels.
- Scroll reveals are skipped entirely under `prefers-reduced-motion: reduce`, and
  the reveal CSS is gated on a `.js` class so content is never hidden if JavaScript
  fails to load.
- Body text meets WCAG AA against its backgrounds; the coral accent is used for
  large text and non-text UI only.

## Still to do for a production launch

- Real content and photography (see above).
- `sitemap.xml`, `robots.txt`, and canonical `<link>` tags.
- Open Graph / Twitter card images — currently no `og:` tags.
- `LocalBusiness` / `Dentist` JSON-LD structured data for search results.
- A working form endpoint and privacy policy.
