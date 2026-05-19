export type Grade = 4 | 5 | 6 | 7 | 8;

export interface SpellingWord {
  word: string;
  trait: string;      // maps to flowers.spelling_trait
  pollenReward: number;
}

const GRADE_4: SpellingWord[] = [
  // Basic prefixes: un-, re-, pre-, dis-
  { word: "unfair",      trait: "prefix",          pollenReward: 1 },
  { word: "rebuild",     trait: "prefix",          pollenReward: 1 },
  { word: "preview",     trait: "prefix",          pollenReward: 1 },
  { word: "dislike",     trait: "prefix",          pollenReward: 1 },
  { word: "unhappy",     trait: "prefix",          pollenReward: 1 },
  { word: "rewrite",     trait: "prefix",          pollenReward: 1 },
  { word: "preheat",     trait: "prefix",          pollenReward: 1 },
  { word: "triangle",    trait: "prefix",          pollenReward: 1 },
  // Basic suffixes: -ful, -less, -ness
  { word: "hopeful",     trait: "suffix",          pollenReward: 1 },
  { word: "careless",    trait: "suffix",          pollenReward: 1 },
  { word: "darkness",    trait: "suffix",          pollenReward: 1 },
  { word: "thankful",    trait: "suffix",          pollenReward: 1 },
  { word: "homeless",    trait: "suffix",          pollenReward: 1 },
  { word: "kindness",    trait: "suffix",          pollenReward: 1 },
  // Sight words
  { word: "because",     trait: "sight_word",      pollenReward: 1 },
  { word: "people",      trait: "sight_word",      pollenReward: 1 },
  { word: "again",       trait: "sight_word",      pollenReward: 1 },
  { word: "friend",      trait: "silent_letter",   pollenReward: 1 },
  { word: "which",       trait: "silent_letter",   pollenReward: 1 },
  { word: "should",      trait: "silent_letter",   pollenReward: 1 },
];

const GRADE_5: SpellingWord[] = [
  // Suffix -tion/-ment
  { word: "necessary",   trait: "double_vowel",    pollenReward: 1 },
  { word: "beautiful",   trait: "suffix",          pollenReward: 1 },
  { word: "definitely",  trait: "suffix",          pollenReward: 1 },
  { word: "separate",    trait: "sight_word",      pollenReward: 1 },
  { word: "occurrence",  trait: "double_vowel",    pollenReward: 1 },
  { word: "government",  trait: "suffix",          pollenReward: 1 },
  { word: "improvement", trait: "suffix",          pollenReward: 1 },
  { word: "movement",    trait: "suffix",          pollenReward: 1 },
  { word: "statement",   trait: "suffix",          pollenReward: 1 },
  { word: "treatment",   trait: "suffix",          pollenReward: 1 },
  { word: "February",    trait: "silent_letter",   pollenReward: 1 },
  { word: "foreign",     trait: "silent_letter",   pollenReward: 1 },
  { word: "guarantee",   trait: "sight_word",      pollenReward: 1 },
  { word: "rhythm",      trait: "consonant_cluster",pollenReward: 1 },
  { word: "lightning",   trait: "silent_letter",   pollenReward: 1 },
  { word: "maintenance", trait: "suffix",          pollenReward: 1 },
  { word: "mischievous", trait: "double_vowel",    pollenReward: 1 },
  { word: "privilege",   trait: "sight_word",      pollenReward: 1 },
  { word: "recommend",   trait: "prefix",          pollenReward: 1 },
  { word: "sincerely",   trait: "suffix",          pollenReward: 1 },
];

const GRADE_6: SpellingWord[] = [
  // Latin roots
  { word: "correspond",      trait: "latin_root",  pollenReward: 2 },
  { word: "environment",     trait: "latin_root",  pollenReward: 2 },
  { word: "conscience",      trait: "latin_root",  pollenReward: 2 },
  { word: "parliament",      trait: "latin_root",  pollenReward: 2 },
  { word: "threshold",       trait: "consonant_cluster", pollenReward: 2 },
  { word: "prejudice",       trait: "prefix",      pollenReward: 2 },
  { word: "pronunciation",   trait: "latin_root",  pollenReward: 2 },
  { word: "exaggerate",      trait: "double_vowel",pollenReward: 2 },
  { word: "embarrass",       trait: "double_vowel",pollenReward: 2 },
  { word: "disappear",       trait: "prefix",      pollenReward: 2 },
  { word: "sergeant",        trait: "irregular",   pollenReward: 2 },
  { word: "extraordinary",   trait: "prefix",      pollenReward: 2 },
  { word: "agriculture",     trait: "latin_root",  pollenReward: 2 },
  { word: "constitution",    trait: "latin_root",  pollenReward: 2 },
  { word: "inevitable",      trait: "prefix",      pollenReward: 2 },
  { word: "mediocre",        trait: "latin_root",  pollenReward: 2 },
  { word: "nocturnal",       trait: "latin_root",  pollenReward: 2 },
  { word: "perimeter",       trait: "latin_root",  pollenReward: 2 },
  { word: "resilience",      trait: "suffix",      pollenReward: 2 },
  { word: "versatile",       trait: "latin_root",  pollenReward: 2 },
];

const GRADE_7: SpellingWord[] = [
  // Greek roots
  { word: "anonymous",       trait: "greek_root",  pollenReward: 2 },
  { word: "catastrophe",     trait: "greek_root",  pollenReward: 2 },
  { word: "chronological",   trait: "greek_root",  pollenReward: 2 },
  { word: "democracy",       trait: "greek_root",  pollenReward: 2 },
  { word: "hypothesis",      trait: "greek_root",  pollenReward: 2 },
  { word: "metamorphosis",   trait: "greek_root",  pollenReward: 2 },
  { word: "philosophy",      trait: "greek_root",  pollenReward: 2 },
  { word: "photosynthesis",  trait: "greek_root",  pollenReward: 2 },
  { word: "psychology",      trait: "greek_root",  pollenReward: 2 },
  { word: "synonym",         trait: "greek_root",  pollenReward: 2 },
  { word: "thermometer",     trait: "greek_root",  pollenReward: 2 },
  { word: "bibliography",    trait: "greek_root",  pollenReward: 2 },
  { word: "choreography",    trait: "greek_root",  pollenReward: 2 },
  { word: "kaleidoscope",    trait: "greek_root",  pollenReward: 2 },
  { word: "philanthropy",    trait: "greek_root",  pollenReward: 2 },
  { word: "sophisticated",   trait: "greek_root",  pollenReward: 2 },
  { word: "archaeology",     trait: "greek_root",  pollenReward: 2 },
  { word: "bureaucracy",     trait: "greek_root",  pollenReward: 2 },
  { word: "cryptography",    trait: "greek_root",  pollenReward: 2 },
  { word: "phenomenon",      trait: "greek_root",  pollenReward: 2 },
];

const GRADE_8: SpellingWord[] = [
  // Advanced academic vocabulary
  { word: "aberration",      trait: "latin_root",  pollenReward: 3 },
  { word: "ambiguous",       trait: "latin_root",  pollenReward: 3 },
  { word: "ambivalent",      trait: "prefix",      pollenReward: 3 },
  { word: "anachronism",     trait: "greek_root",  pollenReward: 3 },
  { word: "circumlocution",  trait: "latin_root",  pollenReward: 3 },
  { word: "colloquial",      trait: "latin_root",  pollenReward: 3 },
  { word: "connotation",     trait: "latin_root",  pollenReward: 3 },
  { word: "demagogue",       trait: "greek_root",  pollenReward: 3 },
  { word: "epitomize",       trait: "greek_root",  pollenReward: 3 },
  { word: "euphemism",       trait: "greek_root",  pollenReward: 3 },
  { word: "hyperbole",       trait: "greek_root",  pollenReward: 3 },
  { word: "idiosyncratic",   trait: "greek_root",  pollenReward: 3 },
  { word: "juxtaposition",   trait: "latin_root",  pollenReward: 3 },
  { word: "magnanimous",     trait: "latin_root",  pollenReward: 3 },
  { word: "onomatopoeia",    trait: "greek_root",  pollenReward: 3 },
  { word: "paradigm",        trait: "greek_root",  pollenReward: 3 },
  { word: "ubiquitous",      trait: "latin_root",  pollenReward: 3 },
  { word: "verisimilitude",  trait: "latin_root",  pollenReward: 3 },
  { word: "perspicacious",   trait: "latin_root",  pollenReward: 3 },
  { word: "loquacious",      trait: "latin_root",  pollenReward: 3 },
];

export const WORD_LISTS: Record<Grade, SpellingWord[]> = {
  4: GRADE_4,
  5: GRADE_5,
  6: GRADE_6,
  7: GRADE_7,
  8: GRADE_8,
};

export const GRADE_LABELS: Record<Grade, string> = {
  4: "4th Grade",
  5: "5th Grade",
  6: "6th Grade",
  7: "7th Grade",
  8: "8th Grade",
};

// Words with this trait secretly influence which flower blooms
export const TRAIT_FLOWER_HINT: Record<string, string> = {
  prefix:           "Vine flowers bloom from prefix words",
  suffix:           "Blooming flowers open from suffix words",
  double_vowel:     "Double-petaled flowers grow from double vowel words",
  silent_letter:    "Ghost flowers appear from silent letter words",
  sight_word:       "Rare mystical flowers emerge from sight words",
  consonant_cluster:"Thorned flowers grow from consonant clusters",
  latin_root:       "Ancient stone flowers rise from Latin roots",
  greek_root:       "Crystal flowers form from Greek roots",
  irregular:        "Wild shape-shifting flowers bloom from irregular words",
};
