// Run this locally with: node fetch-ut-buildings.mjs
// Requires Node 18+ (uses native fetch)
// Output: campusLocations.ts ready to drop into your project

import { writeFileSync } from "fs";

const BBOX = "30.2780,-97.7430,30.2960,-97.7270";

const query = `
[out:json][timeout:60];
(
  way["building"]["name"](${BBOX});
  relation["building"]["name"](${BBOX});
);
out center tags;
`;

console.log("Querying Overpass API for UT Austin campus buildings...");

const response = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  body: query,
  headers: { "Content-Type": "text/plain" },
});

if (!response.ok) {
  console.error("Overpass API error:", response.status, await response.text());
  process.exit(1);
}

const data = await response.json();
const elements = data.elements;
console.log(`Found ${elements.length} named buildings\n`);

const getCategory = (tags) => {
  const building = tags.building ?? "";
  const amenity = tags.amenity ?? "";
  const leisure = tags.leisure ?? "";

  if (["dormitory", "residential", "apartments"].includes(building))
    return "housing";
  if (
    ["cafe", "fast_food", "restaurant", "food_court", "canteen"].includes(
      amenity,
    )
  )
    return "dining";
  if (
    ["sports_centre", "sports_hall"].includes(building) ||
    ["sports_centre", "fitness_centre"].includes(leisure)
  )
    return "recreation";
  if (building === "parking" || amenity === "parking") return "parking";
  if (
    ["university", "college", "library", "classroom", "laboratory"].includes(
      building,
    ) ||
    ["university", "library"].includes(amenity)
  )
    return "academic";
  return "other";
};

const KNOWN_ABBREVIATIONS = {
  "Gates Dell Complex": "GDC",
  "Perry-Castañeda Library": "PCL",
  "Robert Lee Moore Hall": "RLM",
  "Painter Hall": "PAI",
  "Burdine Hall": "BUR",
  "Waggener Hall": "WAG",
  "Garrison Hall": "GAR",
  "Mezes Hall": "MEZ",
  "Batts Hall": "BAT",
  "Parlin Hall": "PAR",
  "Benedict Hall": "BEN",
  "Sutton Hall": "SUT",
  "Goldsmith Hall": "GOL",
  "Battle Hall": "BTL",
  "Architecture Building": "ARC",
  "Winship Drama Building": "WIN",
  "Music Building": "MUS",
  "Belo Center for New Media": "BMC",
  "Jesse H. Jones Communication Center": "CMB",
  "Flawn Academic Center": "FAC",
  "McCombs School of Business": "CBA",
  "Ernest Cockrell Jr. Hall": "ECJ",
  "Engineering Teaching Center II": "ETC",
  "Chemical and Petroleum Engineering Building": "CPE",
  "Aerospace Engineering Building": "ASE",
  "Biomedical Engineering Building": "BME",
  "Engineering Education and Research Center": "EER",
  "Taylor Hall": "TAY",
  "Seay Building": "SEA",
  "Sanchez Building": "SAN",
  "Student Activity Center": "SAC",
  "Student Services Building": "SSB",
  "Bellmont Hall": "BEL",
  "Gregory Gymnasium": "GRE",
  "Recreational Sports Center": "RSC",
  "Harry Ransom Center": "HRC",
  "Jester Center": "JES",
  "Kinsolving Dormitory": "KIN",
  "Andrews Dormitory": "AND",
  "Carothers Dormitory": "CAR",
  "Littlefield Dormitory": "LIT",
  "Moore-Hill Dormitory": "MHD",
  "Texas Union": "UNB",
  "Main Building": "MAI",
  "Sid Richardson Hall": "SRH",
  "Nau Hall": "NAU",
  "Will C. Hogg Building": "WCH",
  "Rowling Hall": "ROW",
  "Norman Hackerman Building": "NHB",
  "Welch Hall": "WEL",
  "Physics, Math and Astronomy Building": "PMA",
  "Darrell K Royal-Texas Memorial Stadium": "DKR",
  "Moody Center": "MOO",
};

const locations = elements
  .filter((el) => el.tags?.name && (el.center?.lat ?? el.lat))
  .map((el) => {
    const tags = el.tags;
    const lat = el.center?.lat ?? el.lat;
    const lon = el.center?.lon ?? el.lon;
    const name = tags.name;
    const abbreviation =
      KNOWN_ABBREVIATIONS[name] ?? tags["short_name"] ?? undefined;
    const address =
      [tags["addr:housenumber"], tags["addr:street"]]
        .filter(Boolean)
        .join(" ") || undefined;
    return {
      name,
      ...(abbreviation && { abbreviation }),
      ...(address && { address }),
      lat: Math.round(lat * 1e6) / 1e6,
      lon: Math.round(lon * 1e6) / 1e6,
      category: getCategory(tags),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const ts = `// Auto-generated from OpenStreetMap Overpass API
// Data: © OpenStreetMap contributors (ODbL)
// Generated: ${new Date().toISOString().split("T")[0]} | Total: ${locations.length} buildings

export type CampusLocation = {
  name: string;
  abbreviation?: string;
  address?: string;
  lat: number;
  lon: number;
  category: "academic" | "dining" | "recreation" | "housing" | "parking" | "other";
};

export const CAMPUS_LOCATIONS: CampusLocation[] = ${JSON.stringify(locations, null, 2)};
`;

writeFileSync("campusLocations.ts", ts);
console.log("Written to campusLocations.ts");
