/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FinancialHub {
  cityName: string;
  slug: string;
  state: string;
  defaultVacancyRate: number;         // localized vacancy percentage (e.g., 6.4 for 6.4%)
  baselineCommercialTaxPercent: number; // localized commercial tax percentage (e.g., 1.45 for 1.45%)
  marketBrief: string;                // regional commercial underwriting insight
}

export interface SEOMetadata {
  title: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
}

/**
 * Structured database containing the top 50 metropolitan financial hubs
 * mapped to regional commercial real estate defaults and underwriting metadata.
 */
export const METROPOLITAN_HUBS: FinancialHub[] = [
  {
    cityName: "New York City",
    slug: "new-york-city",
    state: "NY",
    defaultVacancyRate: 8.2,
    baselineCommercialTaxPercent: 2.85,
    marketBrief: "High-density tier-1 core market with compressed cap rates and rigid regulatory compliance covenants."
  },
  {
    cityName: "Los Angeles",
    slug: "los-angeles",
    state: "CA",
    defaultVacancyRate: 6.8,
    baselineCommercialTaxPercent: 1.25,
    marketBrief: "Gateway West Coast hub exhibiting strong logistics, entertainment-focused submarkets, and structural zoning constraints."
  },
  {
    cityName: "Chicago",
    slug: "chicago",
    state: "IL",
    defaultVacancyRate: 9.5,
    baselineCommercialTaxPercent: 2.30,
    marketBrief: "Established logistics and manufacturing focal point with high historical tax ratios demanding precise cash flow coverage checks."
  },
  {
    cityName: "Houston",
    slug: "houston",
    state: "TX",
    defaultVacancyRate: 11.2,
    baselineCommercialTaxPercent: 2.45,
    marketBrief: "Energetic development pipeline without formal municipal zoning laws, resulting in higher localized vacancy tolerances."
  },
  {
    cityName: "Phoenix",
    slug: "phoenix",
    state: "AZ",
    defaultVacancyRate: 7.4,
    baselineCommercialTaxPercent: 1.35,
    marketBrief: "Intense migration inflow backing active multi-family construction pipelines with dynamic valuation adjustments."
  },
  {
    cityName: "Philadelphia",
    slug: "philadelphia",
    state: "PA",
    defaultVacancyRate: 8.9,
    baselineCommercialTaxPercent: 2.10,
    marketBrief: "Mature industrial inventory with stable tenant retention profile but elevated territorial tax assessments."
  },
  {
    cityName: "San Antonio",
    slug: "san-antonio",
    state: "TX",
    defaultVacancyRate: 7.2,
    baselineCommercialTaxPercent: 2.15,
    marketBrief: "Resilient institutional presence supported by consistent public-sector and aerospace defense payroll streams."
  },
  {
    cityName: "San Diego",
    slug: "san-diego",
    state: "CA",
    defaultVacancyRate: 5.4,
    baselineCommercialTaxPercent: 1.15,
    marketBrief: "Tight life-science laboratory and naval military inventory showing compressed asset cap rates."
  },
  {
    cityName: "Dallas",
    slug: "dallas",
    state: "TX",
    defaultVacancyRate: 8.5,
    baselineCommercialTaxPercent: 2.20,
    marketBrief: "Major corporate relocation capital fueled by state-level tax incentives and high institutional inventory liquidities."
  },
  {
    cityName: "San Jose",
    slug: "san-jose",
    state: "CA",
    defaultVacancyRate: 8.1,
    baselineCommercialTaxPercent: 1.30,
    marketBrief: "Global technology epicenter with superior average rent bases but highly sensitive to venture capital and interest margins."
  },
  {
    cityName: "Austin",
    slug: "austin",
    state: "TX",
    defaultVacancyRate: 9.8,
    baselineCommercialTaxPercent: 2.05,
    marketBrief: "Dynamic tech hub recovering from substantial multi-family supply waves with positive mid-term yield prospects."
  },
  {
    cityName: "Jacksonville",
    slug: "jacksonville",
    state: "FL",
    defaultVacancyRate: 6.9,
    baselineCommercialTaxPercent: 1.40,
    marketBrief: "High-yield coastal logistics gateway with stable underlying distribution and transport networks."
  },
  {
    cityName: "Fort Worth",
    slug: "fort-worth",
    state: "TX",
    defaultVacancyRate: 7.1,
    baselineCommercialTaxPercent: 2.18,
    marketBrief: "Rapid industrial center with immediate connection to international rail terminals and heavy cargo aerospace centers."
  },
  {
    cityName: "Columbus",
    slug: "columbus",
    state: "OH",
    defaultVacancyRate: 6.3,
    baselineCommercialTaxPercent: 1.95,
    marketBrief: "Growing tech-manufacturing cluster backed by strong public research centers and localized tech investments."
  },
  {
    cityName: "Charlotte",
    slug: "charlotte",
    state: "NC",
    defaultVacancyRate: 7.0,
    baselineCommercialTaxPercent: 1.12,
    marketBrief: "Key Eastern banking operational headquarters showing high security and premium office-to-housing adaptations."
  },
  {
    cityName: "San Francisco",
    slug: "san-francisco",
    state: "CA",
    defaultVacancyRate: 12.5,
    baselineCommercialTaxPercent: 1.22,
    marketBrief: "Highly visible market undergoing substantial commercial repositioning and space reclamation cycles."
  },
  {
    cityName: "Indianapolis",
    slug: "indianapolis",
    state: "IN",
    defaultVacancyRate: 7.6,
    baselineCommercialTaxPercent: 1.80,
    marketBrief: "Central crossroads freight capital offering robust high-yield industrial profiles to institutional players."
  },
  {
    cityName: "Seattle",
    slug: "seattle",
    state: "WA",
    defaultVacancyRate: 8.0,
    baselineCommercialTaxPercent: 1.05,
    marketBrief: "Leading tech-talent labor workspace with premium life-science conversions and high sustainability caps."
  },
  {
    cityName: "Denver",
    slug: "denver",
    state: "CO",
    defaultVacancyRate: 7.8,
    baselineCommercialTaxPercent: 1.55,
    marketBrief: "Mountain logistics hub featuring strong retail and adaptive industrial spaces for regional deployment."
  },
  {
    cityName: "Washington",
    slug: "washington-dc",
    state: "DC",
    defaultVacancyRate: 10.4,
    baselineCommercialTaxPercent: 1.90,
    marketBrief: "Federal tenant anchor structures providing recession-resistant cash flow profiles despite corporate vacancies."
  },
  {
    cityName: "Boston",
    slug: "boston",
    state: "MA",
    defaultVacancyRate: 6.5,
    baselineCommercialTaxPercent: 1.65,
    marketBrief: "Top-tier life-science research clusters with consistent global endowment capital backing robust land assets."
  },
  {
    cityName: "El Paso",
    slug: "el-paso",
    state: "TX",
    defaultVacancyRate: 5.9,
    baselineCommercialTaxPercent: 2.25,
    marketBrief: "Crucial international trade cross-border manufacturing node with high-capacity warehouse assets."
  },
  {
    cityName: "Nashville",
    slug: "nashville",
    state: "TN",
    defaultVacancyRate: 7.9,
    baselineCommercialTaxPercent: 1.50,
    marketBrief: "High hospitality growth and major healthcare service corporate clusters driving mixed-use yields."
  },
  {
    cityName: "Detroit",
    slug: "detroit",
    state: "MI",
    defaultVacancyRate: 10.1,
    baselineCommercialTaxPercent: 2.50,
    marketBrief: "Industrial renaissance market presenting deep value-add possibilities for sophisticated equity syndicates."
  },
  {
    cityName: "Oklahoma City",
    slug: "oklahoma-city",
    state: "OK",
    defaultVacancyRate: 8.3,
    baselineCommercialTaxPercent: 1.35,
    marketBrief: "Low overall entry cost basis with high localized resource-market yields for family offices."
  },
  {
    cityName: "Portland",
    slug: "portland",
    state: "OR",
    defaultVacancyRate: 8.8,
    baselineCommercialTaxPercent: 1.48,
    marketBrief: "Eco-conscious urban architecture with compressed urban boundary codes limiting peripheral retail pipelines."
  },
  {
    cityName: "Las Vegas",
    slug: "las-vegas",
    state: "NV",
    defaultVacancyRate: 7.7,
    baselineCommercialTaxPercent: 1.10,
    marketBrief: "Tourism and convention-based consumer focus with extensive industrial service distribution rings."
  },
  {
    cityName: "Memphis",
    slug: "memphis",
    state: "TN",
    defaultVacancyRate: 9.3,
    baselineCommercialTaxPercent: 1.90,
    marketBrief: "Global logistics superpower anchored by international shipping super-hubs and distribution channels."
  },
  {
    cityName: "Louisville",
    slug: "louisville",
    state: "KY",
    defaultVacancyRate: 7.3,
    baselineCommercialTaxPercent: 1.58,
    marketBrief: "Essential freight intersection and beverage supply capital displaying steady multi-tenant occupancy."
  },
  {
    cityName: "Baltimore",
    slug: "baltimore",
    state: "MD",
    defaultVacancyRate: 9.0,
    baselineCommercialTaxPercent: 2.24,
    marketBrief: "Historic port facilities with major medical campus dependencies yielding steady medical office demand."
  },
  {
    cityName: "Milwaukee",
    slug: "milwaukee",
    state: "WI",
    defaultVacancyRate: 8.4,
    baselineCommercialTaxPercent: 2.40,
    marketBrief: "Stable Midwest workforce base showing solid cash-on-cash performance without excessive premium inflation."
  },
  {
    cityName: "Albuquerque",
    slug: "albuquerque",
    state: "NM",
    defaultVacancyRate: 6.2,
    baselineCommercialTaxPercent: 1.20,
    marketBrief: "Steady semiconductor and space-defense technology investment driving submarket warehouse pricing."
  },
  {
    cityName: "Tucson",
    slug: "tucson",
    state: "AZ",
    defaultVacancyRate: 6.7,
    baselineCommercialTaxPercent: 1.42,
    marketBrief: "Warm desert technology corridor boasting consistent medical center and adult community expansions."
  },
  {
    cityName: "Fresno",
    slug: "fresno",
    state: "CA",
    defaultVacancyRate: 5.1,
    baselineCommercialTaxPercent: 1.18,
    marketBrief: "Primary agricultural transport nexus showing high land pricing and rising institutional storage demand."
  },
  {
    cityName: "Sacramento",
    slug: "sacramento",
    state: "CA",
    defaultVacancyRate: 7.5,
    baselineCommercialTaxPercent: 1.21,
    marketBrief: "State-government anchor workforce buffering urban office vacancies with suburban retail demand."
  },
  {
    cityName: "Kansas City",
    slug: "kansas-city",
    state: "MO",
    defaultVacancyRate: 7.9,
    baselineCommercialTaxPercent: 1.74,
    marketBrief: "Highly connected railway network hub backed by central nationwide postal distribution investments."
  },
  {
    cityName: "Mesa",
    slug: "mesa",
    state: "AZ",
    defaultVacancyRate: 6.0,
    baselineCommercialTaxPercent: 1.28,
    marketBrief: "Rapidly expanding residential center pulling commercial healthcare projects into new development zones."
  },
  {
    cityName: "Atlanta",
    slug: "atlanta",
    state: "GA",
    defaultVacancyRate: 9.2,
    baselineCommercialTaxPercent: 1.30,
    marketBrief: "Southeastern financial heavyweight with dynamic tech operations and massive intermodal airport links."
  },
  {
    cityName: "Omaha",
    slug: "omaha",
    state: "NE",
    defaultVacancyRate: 5.5,
    baselineCommercialTaxPercent: 1.88,
    marketBrief: "Resilient insurance and agricultural giant with consistent defensive capital ratings."
  },
  {
    cityName: "Colorado Springs",
    slug: "colorado-springs",
    state: "CO",
    defaultVacancyRate: 6.1,
    baselineCommercialTaxPercent: 1.15,
    marketBrief: "Military defense, space command operations, and aerospace hubs supporting dynamic sub-offices."
  },
  {
    cityName: "Raleigh",
    slug: "raleigh",
    state: "NC",
    defaultVacancyRate: 8.4,
    baselineCommercialTaxPercent: 1.10,
    marketBrief: "Research Triangle regional node with top-tier talent inflows feeding premium campus labs."
  },
  {
    cityName: "Long Beach",
    slug: "long-beach",
    state: "CA",
    defaultVacancyRate: 6.2,
    baselineCommercialTaxPercent: 1.25,
    marketBrief: "Busiest port complex in America supporting extensive localized dry-dock and industrial distribution."
  },
  {
    cityName: "Virginia Beach",
    slug: "virginia-beach",
    state: "VA",
    defaultVacancyRate: 6.4,
    baselineCommercialTaxPercent: 1.00,
    marketBrief: "Defense dependencies and substantial sea tourism assets backing retail real estate structures."
  },
  {
    cityName: "Miami",
    slug: "miami",
    state: "FL",
    defaultVacancyRate: 6.2,
    baselineCommercialTaxPercent: 1.62,
    marketBrief: "High global influx and active crypto-fintech expansion compressing luxury retail and office cap rates."
  },
  {
    cityName: "Oakland",
    slug: "oakland",
    state: "CA",
    defaultVacancyRate: 11.5,
    baselineCommercialTaxPercent: 1.38,
    marketBrief: "Bay Area shipping point with high regional connectivity undergoing substantial rent adjustments."
  },
  {
    cityName: "Minneapolis",
    slug: "minneapolis",
    state: "MN",
    defaultVacancyRate: 9.1,
    baselineCommercialTaxPercent: 2.22,
    marketBrief: "Extensive corporate footprint with advanced medical engineering and agricultural processing rings."
  },
  {
    cityName: "Tulsa",
    slug: "tulsa",
    state: "OK",
    defaultVacancyRate: 8.5,
    baselineCommercialTaxPercent: 1.32,
    marketBrief: "Resilient industrial park options showing high cash gains on mid-sized industrial investments."
  },
  {
    cityName: "Bakersfield",
    slug: "bakersfield",
    state: "CA",
    defaultVacancyRate: 5.3,
    baselineCommercialTaxPercent: 1.14,
    marketBrief: "Energy production and agro-logistics baseline supporting high-volume storage complexes."
  },
  {
    cityName: "Wichita",
    slug: "wichita",
    state: "KS",
    defaultVacancyRate: 6.8,
    baselineCommercialTaxPercent: 1.55,
    marketBrief: "World aerospace manufacturing central base showing solid tenant records in manufacturing centers."
  },
  {
    cityName: "Arlington",
    slug: "arlington",
    state: "TX",
    defaultVacancyRate: 7.0,
    baselineCommercialTaxPercent: 2.10,
    marketBrief: "Core entertainment and distribution corridor locked perfectly between Dallas and Fort Worth."
  }
];

/**
 * Requirement 1: Static routing configuration parameters generator
 * Returns slugs for static building or path parsing (e.g. getStaticPaths in Astro / Next.js)
 */
export function generateStaticParams() {
  return METROPOLITAN_HUBS.map(hub => ({
    city: hub.slug
  }));
}

/**
 * Matching type for Static Path wrapper structures (Astro compliance)
 */
export function getStaticPaths() {
  return METROPOLITAN_HUBS.map(hub => {
    return {
      params: { city: hub.slug },
      props: { hub }
    };
  });
}

/**
 * Requirement 3: Programmatic Meta Injection Layer
 * Returns SEO properties exactly mapping high-CPC landing page patterns.
 */
export function generateSEOMetadata(cityName: string, slug: string): SEOMetadata {
  return {
    title: `Institutional Commercial DSCR Calculator - ${cityName} Underwriting Workspace`,
    metaDescription: `Run real-time commercial debt yield and debt service coverage ratios for assets in ${cityName}. Pure precision client-side underwriting engine.`,
    keywords: `commercial dscr calculator, debt yield calculator, ${cityName} commercial real estate, ${cityName} underwriting tool, cap rate horizon, underwriting workspace ${cityName}`,
    canonicalUrl: `https://ai.studio/build/commercial-finance-engine/market/${slug}`,
    ogTitle: `${cityName} Commercial Loan DSCR Analytics Hub`,
    ogDescription: `Evaluate cash flow debt coverage ratios, 10-year exit cap rate projections, and SaaS portfolio unit economics for investments in ${cityName}.`
  };
}
