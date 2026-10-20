# Archivle

A daily price-guessing game for archive fashion and streetwear. Each day shows one item from Grailed's Staff Picks or a popular streetwear brand. You get six guesses, and a guess within $50 of the listed price wins.

Play: https://archivle.pages.dev/

## Files

- `items.js`: the item list (brand, title, size, condition, asking price, seller, photo links).
- `config.js`: the GitHub repo name and Google AdSense settings.
- `app.js`: game logic. `style.css`: styles.

## Adding items

Add an entry to `ITEMS` in `items.js`. The `photos` paths are the part of the Grailed image URL after `https://media-assets.grailed.com/prd/listing/`. Items are shuffled with a fixed seed, so adding items changes which item shows on future days.

## Making money

All of these are set in `config.js`.

### Sponsor spot
A small sponsor line sits under the item. Until you have a sponsor, it says "Sponsor this spot" and links to `sponsor.contact`, or to a GitHub issue if that's empty. When someone pays for the spot, fill in `sponsor.name`, `sponsor.text` and `sponsor.url`.

### Affiliate links
If you join an affiliate program for Grailed or another resale site, put its link format in `affiliateTemplate` with `{url}` where the listing address goes. Every "View listing" link then goes through your affiliate link, and a disclosure line appears in the footer.

### Tips
Put a Ko-fi or Buy Me a Coffee link in `tipUrl` to show a "Tip the maker" link in the footer.

### Google AdSense
1. Sign up at adsense.google.com and add the site. AdSense usually needs a domain you own (like `archivle.com`), not a free `.pages.dev` or `.github.io` address.
2. AdSense gives you a publisher ID (`ca-pub-...`). Create an `ads.txt` file in this folder with the exact line AdSense shows you, then push.
3. In AdSense, open **Privacy & messaging** and turn on the consent message for European visitors. The privacy page says visitors there are asked for consent, so this needs to be on.
4. Once approved, create two display ad units, then put the publisher ID and the two slot IDs in `config.js`.

The ad spaces stay hidden until `config.js` has a publisher ID. AdSense may reject or later disable sites that show content they don't have rights to, which can include the seller photos.

## Photos

Photos are embedded from Grailed's image server. They are not copied into this repo. They belong to their sellers. Every item credits and links its seller and listing. If a seller asks for removal, delete that item from `items.js`.

Not affiliated with Grailed.

## Deploying

The site is hosted on Cloudflare Pages as the `archivle` project. To publish changes, from this folder run:

```bash
npx wrangler pages deploy . --project-name archivle --branch main
```
