const ALLERGY_ES_TO_EN: Record<string, string> = {
  "maní": "peanut",
  "mani": "peanut",
  "lactosa": "lactose",
  "gluten": "gluten",
  "huevo": "egg",
  "pescado": "fish",
  "soja": "soy",
  "frutos secos": "tree_nuts",
};

const ALLERGY_EN_TO_ES: Record<string, string> = {
  peanut: "Maní",
  lactose: "Lactosa",
  gluten: "Gluten",
  egg: "Huevo",
  fish: "Pescado",
  soy: "Soja",
  tree_nuts: "Frutos secos",
};

export function parseAllergyInput(input: string): string[] {
  return input
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .map((entry) => ALLERGY_ES_TO_EN[entry])
    .filter((tag): tag is string => Boolean(tag));
}

export function reverseAllergyLabel(tag: string): string {
  return ALLERGY_EN_TO_ES[tag] ?? tag;
}
