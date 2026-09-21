export interface Word {
  /** lesnummer: 1-41 cursus, 100+ bonus, 200+ zinnen */
  l: number;
  nl: string;
  it: string;
  t: "noun" | "verb" | "adjective" | "other" | "sentence";
}

export type Direction = "it2nl" | "nl2it";
/** "order" is de volgordeoefening en bestaat alleen voor zinnen. */
export type Style = "mcq" | "type" | "order";
export type GameMode = "test" | "practice" | "review" | "complete";

export interface Options {
  lessons: number[];
  direction: Direction | "mixed";
  style: Style | "mixed";
  mode: GameMode;
  /** 0 = alle woorden */
  count: number;
  /** oude woorden uit andere lessen tussendoor mee laten komen */
  mixReview: boolean;
  audio: boolean;
}

export interface Question {
  id: string;
  word: Word;
  direction: Direction;
  style: Style;
  prompt: string;
  answer: string;
  choices: string[];
  /** Voor de volgordeoefening: de losse woorden, door elkaar. */
  tokens: string[];
  /** Voor de volgordeoefening: de juiste volgorde. */
  solution: string[];
  /** Een woord uit een eerdere les dat tussendoor terugkomt. */
  isReview: boolean;
}

/** Een blok binnen een grammaticahoofdstuk: uitleg, tabel, voorbeelden of tip. */
export type GrammarBlock =
  | { kind: "text"; body: string }
  | { kind: "table"; caption?: string; head: string[]; rows: string[][] }
  | { kind: "examples"; items: { it: string; nl: string }[] }
  | { kind: "tip"; body: string };

export interface GrammarChapter {
  /** stabiele slug, dient als key en (later) voor oefeningen */
  id: string;
  /** groep in het overzicht, bv. "Werkwoorden" of "Voorzetsels" */
  category: string;
  title: string;
  /** korte omschrijving van één regel */
  summary: string;
  blocks: GrammarBlock[];
}

export type Verdict = "correct" | "almost" | "wrong";

export interface Attempt {
  question: Question;
  given: string;
  verdict: Verdict;
  note?: string;
}
