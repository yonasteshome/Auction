export const MARKETS_BY_REGION: Record<string, string[]> = {
  "Addis Ababa": [
    "Merkato",
    "Shola",
    "Atkilt Tera",
    "Bole",
    "Piassa",
    "Megenagna",
    "Saris",
    "Kality",
  ],
  Adama: ["Adama Central Market", "Adama Bus Station Area"],
  Hawassa: ["Hawassa Main Market"],
  "Bahir Dar": ["Bahir Dar Market"],
  Other: [],
};

export const CITIES = Object.keys(MARKETS_BY_REGION);

export const QUALITY_GRADES: Record<string, string[]> = {
  teff: ["Magna", "Sergegna", "Dega", "White Teff"],
  coffee: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"],
};

export function gradesForItem(itemName: string): string[] {
  const lower = itemName.toLowerCase();
  if (lower.includes("teff")) return QUALITY_GRADES.teff;
  if (lower.includes("coffee")) return QUALITY_GRADES.coffee;
  return [];
}

export const DRAFT_STORAGE_KEY = "spendsense-price-submission-draft";
