/**
 * Borepix community commitment: supply drives for The Hoboken Shelter, the partner shelter a few miles
 * from the company's home in Kearny, New Jersey. Pledges made on the site are recorded to the
 * supporter's account and fulfilled by Borepix from the shelter's published wish lists; no money is
 * collected on the site.
 *
 * Partner facts, mission wording and contact details are the shelter's official messaging as supplied
 * by Borepix; the address, phone and founding year also appear on hobokenshelter.org.
 */
export const community = {
  eyebrow: "Community · Partner shelter",
  title: "Giving back to where we build.",
  statement:
    "Giving back to where we build—proudly supporting and funding supply drives for The Hoboken Shelter, our partner shelter in Hudson County, New Jersey.",
  body: [
    "Borepix is built in Kearny, New Jersey, a few miles from The Hoboken Shelter. The shelter serves neighbours through every season, and its supply list never gets shorter.",
    "A portion of every test key sold funds a quarterly supply drive. Pledges made here are added to that drive and fulfilled by Borepix from the shelter's published wish lists.",
  ],
  /** What the drives purchase, in priority order. */
  driveItems: ["Twin sheets and blankets", "Socks and thermal layers", "Toiletry kits", "Shelf-stable meals", "Winter coats"],
  /** One-click pledge amounts, USD. Hidden while commerce is disabled; item pledges are offered instead. */
  tiers: [
    { amount: 10, label: "Supporter" },
    { amount: 25, label: "Advocate" },
    { amount: 50, label: "Champion" },
    { amount: 100, label: "Benefactor" },
  ],
  /** The next drive date printed on the widget. */
  nextDrive: "December 2026",

  partner: {
    name: "The Hoboken Shelter",
    shortName: "Hoboken Shelter",
    mission:
      "The mission of The Hoboken Shelter is to be a community partnership that transforms lives by providing meals for the hungry, shelter for the homeless, and services to support people to become housed.",
    since: 1982,
    status: "501(c)(3) nonprofit",
    /** The shelter's own headline numbers. */
    stats: [
      { value: "1,000", label: "showers every week" },
      { value: "500", label: "meals every day" },
      { value: "50", label: "safe sleeps every night" },
    ],
    website: { label: "www.HobokenShelter.org", href: "https://www.hobokenshelter.org" },
    wishlist: { label: "Amazon Wish List", href: "https://www.amazon.com/registries/gl/guest-view/2X5BFBZLCBPUL" },
    wishlistHub: { label: "All wish lists", href: "https://hobokenshelter.org/wish-list/" },
    impactReport: { label: "Digital impact report", href: "https://hobokenshelter.aflip.in/9f45d6eb85.html" },
    address: { street: "300 Bloomfield Street", locality: "Hoboken, NJ 07030" },
    phone: { display: "201.656.5069", href: "tel:+12016565069" },
    contact: { name: "Melinda Vickerman", role: "Development & Communications Coordinator" },
  },
} as const;
