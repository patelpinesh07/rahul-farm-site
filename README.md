# Rahul Farm website

Ready-to-host website for Rahul Farm Natural Jaggery. Plain HTML, CSS and JavaScript, so it needs no build step and runs on Netlify, Vercel or any hosting.

## Files

```
index.html              Home page (all sections)
products/*.html         One page per product (photos, details, order on WhatsApp)
shipping-returns.html   Shipping and returns policy
privacy-policy.html     Privacy policy
terms.html              Terms of service
404.html                Page not found
assets/js/config.js     ← ALL business details and prices (edit this one)
assets/js/main.js       WhatsApp links, order buttons, form, tracking
assets/css/style.css    Design
assets/img/             Photos, favicon, share image
robots.txt, sitemap.xml SEO
netlify.toml, vercel.json  Hosting settings
```

## 1. Fill your details (एक ही फ़ाइल)

Open `assets/js/config.js` and fill:

- `whatsapp`: country code + number, digits only, e.g. `919876543210`
- `phone`, `email`, `pincode`, `hours`
- `fssai` (FSSAI licence number, shown in the footer) and `gstin` (only if GST registered)
- `moq`, `payment`, `dispatchDays`, `deliveryDays`, `shelfLife`
- `instagram`, `facebook`, `youtube` (full links)
- For each product: `mrp` (retail price per pack) and `wholesale` (rate), numbers only, e.g. `mrp: 150`
- `metaPixelId` and `ga4Id` when you're ready to track ads

Anything left empty is hidden, or replaced by a "confirmed on WhatsApp" line, so the site never shows blanks.

## 2. Put it live

### Netlify (simplest)
1. Go to https://app.netlify.com/drop
2. Drag the whole `rahul-farm-site` folder onto the page. The site is live in a few seconds on a `.netlify.app` link.
3. To update later: Site → Deploys → drag the folder again.
4. Your own domain: Site configuration → Domain management → Add a domain, then follow the DNS steps shown.

### Vercel
1. Put this folder in a GitHub repository.
2. Go to https://vercel.com/new, import the repository, keep "Framework: Other", click Deploy.
3. Add your domain under Project → Settings → Domains.

## 3. After you have a domain

Replace `YOUR-DOMAIN` with your real domain (for example `www.rahulfarm.in`) in:
- `index.html` and every file in `products/` (canonical and og: tags at the top)
- `robots.txt`
- `sitemap.xml`

and set `domain: 'https://www.rahulfarm.in'` in `config.js`.

## 4. Meta ads tracking

Meta Pixel **1154272696988305** (Rahul Farm 19-11) is set in `config.js` and runs on every page (home, all product pages, policy pages, 404). The site sends:

| Action on the site | Meta event |
| --- | --- |
| Any page opens | PageView |
| Product page opens; product range, shop or price list scrolled into view | ViewContent |
| WhatsApp chat or Ask a question button, phone call, email | Contact |
| Wholesale form "Send on WhatsApp"; product page "Get wholesale price on WhatsApp" | Lead |
| "Order" (shop card) or "Order on WhatsApp" (product page, For home) | InitiateCheckout |
| First "+" on a pack quantity | AddToCart |
| Picking varieties or a kg quantity | CustomizeProduct |
| Every WhatsApp button | WhatsAppClick (custom, with the button name and page) |
| Every phone button | CallClick (custom) |
| Every other button or link card (Get wholesale price, View details, tabs…) | ButtonClick (custom) |

Purchases happen on WhatsApp, so a Purchase event cannot fire from the site.

Use **Lead** as the optimisation event for wholesale campaigns and **InitiateCheckout** for retail. Check events in Events Manager → Test events before running ads.

## 5. Check before going live

- Tap every WhatsApp button on your phone and confirm it opens a chat with your number and the right message.
- Read the three policy pages and change anything that doesn't match how you work (refund days, damage window, etc.). They are templates, not legal advice.
- Share the link on WhatsApp once to see the preview image.
