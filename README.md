# Archivle

A daily price-guessing game for archive fashion. Each day shows one item from Grailed's Staff Picks. You get six guesses, and a guess within $100 of the listed price wins.

Play: https://cashleemuldrew.github.io/archivle/

## Files

- `items.js`: the item list (brand, title, size, condition, asking price, seller, photo links).
- `config.js`: the GitHub repo name and Google AdSense settings.
- `app.js`: game logic. `style.css`: styles.

## Adding items

Add an entry to `ITEMS` in `items.js`. The `photos` paths are the part of the Grailed image URL after `https://media-assets.grailed.com/prd/listing/`. Items are shuffled with a fixed seed, so adding items changes which item shows on future days.

## Turning on ads

1. Sign up for Google AdSense and add this site.
2. AdSense gives you a publisher ID (`ca-pub-...`). Create an `ads.txt` file in this folder with the line AdSense shows you.
3. Once approved, create two display ad units, then put the publisher ID and the two slot IDs in `config.js`.

The ad spaces stay hidden until `config.js` has a publisher ID.

## Photos

Photos are embedded from Grailed's image server. They are not copied into this repo. They belong to their sellers. Every item credits and links its seller and listing. If a seller asks for removal, delete that item from `items.js`.

Not affiliated with Grailed.
