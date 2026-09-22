import rawGrammar from "../data/grammar.json";
import type { GrammarChapter } from "./types";

export const GRAMMAR: GrammarChapter[] = rawGrammar as GrammarChapter[];

/** De categorieën in de volgorde waarin ze voor het eerst voorkomen. */
export const GRAMMAR_CATEGORIES: string[] = [
  ...new Set(GRAMMAR.map((c) => c.category)),
];

/** Hoofdstukken gegroepeerd per categorie, handig voor het overzicht. */
export const GRAMMAR_BY_CATEGORY: { category: string; chapters: GrammarChapter[] }[] =
  GRAMMAR_CATEGORIES.map((category) => ({
    category,
    chapters: GRAMMAR.filter((c) => c.category === category),
  }));

export function grammarChapter(id: string): GrammarChapter | undefined {
  return GRAMMAR.find((c) => c.id === id);
}
