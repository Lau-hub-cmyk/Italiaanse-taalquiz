import rawVerbInfo from "../data/verbinfo.json";
import type { Word } from "./types";

export interface VerbInfo {
  it: string;
  nl: string;
  /** "1e ev", "2e ev", "3e ev", "1e mv", "2e mv", "3e mv", "infinitief" of "deelwoord" */
  p: string;
  /** de Italiaanse infinitief van dit werkwoord */
  inf: string;
}

const BY_KEY = new Map<string, VerbInfo>();
for (const v of rawVerbInfo as VerbInfo[]) {
  BY_KEY.set(`${v.it}||${v.nl}`, v);
}

/** De persoons- en infinitiefinfo van een werkwoord, of null als die (nog) niet bekend is. */
export function verbInfo(word: Word): VerbInfo | null {
  if (word.t !== "verb") return null;
  return BY_KEY.get(`${word.it}||${word.nl}`) ?? null;
}

/** Kort label om te tonen, bv. "1e ev · mangiare" of "infinitief". */
export function verbTag(info: VerbInfo): string {
  if (info.p === "infinitief") return "infinitief";
  return `${info.p} · ${info.inf}`;
}
