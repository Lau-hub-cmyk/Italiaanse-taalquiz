import rawExercises from "../data/exercises.json";
import type { GrammarExercise } from "./types";
import { grammarChapter } from "./grammar";

export const EXERCISES: GrammarExercise[] = rawExercises as GrammarExercise[];

/** De categorie van een oefening, afgeleid van het bijbehorende hoofdstuk. */
export function exerciseCategory(ex: GrammarExercise): string {
  return grammarChapter(ex.chapter)?.category ?? "Overig";
}

/** Alle oefeningen bij één hoofdstuk. */
export function exercisesForChapter(id: string): GrammarExercise[] {
  return EXERCISES.filter((e) => e.chapter === id);
}

/** Hoofdstuk-id's die minstens één oefening hebben. */
export const CHAPTERS_WITH_EXERCISES = new Set(EXERCISES.map((e) => e.chapter));
