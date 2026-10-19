// Site settings. Edit these, commit, and push.
const CONFIG = {
  // GitHub repo, used for the "remove a photo" and "sponsor" links.
  repo: "cashleemuldrew/archivle",

  // Sponsor spot, shown under the item. With name empty, the spot shows
  // a "Sponsor this spot" note instead, linking to `contact`.
  sponsor: {
    name: "",        // e.g. "Second Life Vintage"
    text: "",        // e.g. "Archive pieces, shipped worldwide."
    url: "",         // the sponsor's site
    // Where sponsor inquiries go. Leave empty to use a GitHub issue.
    contact: "",     // e.g. "mailto:you@example.com"
  },

  // Affiliate links. If your affiliate program gives you a link format,
  // put it here with {url} where the listing address goes.
  // Example: "https://example-affiliate.com/track?id=123&dest={url}"
  // Leave empty to link straight to the listing.
  affiliateTemplate: "",

  // Tip jar (Ko-fi, Buy Me a Coffee, ...). Empty hides the link.
  tipUrl: "",

  // Google AdSense. Leave client empty and the ad spaces stay hidden.
  // After AdSense approves the site, paste your publisher ID ("ca-pub-...")
  // and the ad unit slot IDs from your AdSense dashboard.
  adsense: {
    client: "",
    slotTop: "",
    slotBottom: "",
  },
};
