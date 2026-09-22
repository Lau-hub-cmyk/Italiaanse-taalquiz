import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  BONUS_LESSONS,
  COURSE_LESSONS,
  SENTENCE_LESSONS,
  WORDS,
  WORDS_BY_LESSON,
  lessonSubtitle,
  lessonTitle,
  wordKey,
} from "../lib/words";
import { speak } from "../lib/speech";
import { verbInfo, verbTag } from "../lib/verbs";
import type { Progress } from "../lib/storage";
import type { Word } from "../lib/types";
import { BackBar, Card, SpeakerButton } from "./ui";

function WordRow({ word, mastered }: { word: Word; mastered: boolean }) {
  const info = verbInfo(word);
  return (
    <div className="flex items-center gap-3 border-t-2 border-line py-2.5 first:border-t-0">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-muted">{word.nl}</span>
        <span className="block truncate font-display text-base font-semibold text-ink">
          {word.it}
        </span>
        {info && (
          <span className="mt-0.5 inline-block rounded-md bg-lilac-soft px-1.5 py-0.5 text-xs font-extrabold text-lilac">
            {verbTag(info)}
          </span>
        )}
      </span>
      {mastered && (
        <span title="Beheerst" className="text-sm text-pino" aria-hidden>
          ✓
        </span>
      )}
      <SpeakerButton onClick={() => speak(word.it, "it-IT")} label={`Spreek ${word.it} uit`} />
    </div>
  );
}

function LessonChips({
  lessons,
  selected,
  onSelect,
  numeric,
}: {
  lessons: number[];
  selected: number;
  onSelect: (l: number) => void;
  numeric?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {lessons.map((l) => {
        const on = l === selected;
        return (
          <button
            key={l}
            type="button"
            onClick={() => onSelect(l)}
            aria-pressed={on}
            title={lessonSubtitle(l)}
            className={`rounded-2xl border-b-4 font-display font-semibold transition-[transform,border-width] duration-75 active:translate-y-[3px] active:border-b-0 ${
              numeric ? "size-11 text-base" : "px-3.5 py-2.5 text-sm font-extrabold"
            } ${
              on
                ? "bg-cobalt text-on-accent border-cobalt-deep"
                : "bg-raised text-ink border-edge hover:brightness-95"
            }`}
          >
            {numeric ? l : lessonSubtitle(l)}
          </button>
        );
      })}
    </div>
  );
}

export function LibraryScreen({
  progress,
  onBack,
}: {
  progress: Progress;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<number>(COURSE_LESSONS[0] ?? 1);
  const [query, setQuery] = useState("");

  const isMastered = (w: Word) => (progress.words[wordKey(w)]?.box ?? 0) >= 2;

  const trimmed = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!trimmed) return [];
    return WORDS.filter(
      (w) => w.nl.toLowerCase().includes(trimmed) || w.it.toLowerCase().includes(trimmed),
    ).slice(0, 100);
  }, [trimmed]);

  const lessonWords = WORDS_BY_LESSON.get(selected) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6"
    >
      <BackBar title="Woordenlijst" onBack={onBack} />

      <Card className="p-4 sm:p-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek een woord of vertaling..."
          className="w-full rounded-2xl border-2 border-line bg-raised px-4 py-3 text-base font-bold text-ink placeholder:text-muted focus:border-cobalt focus:outline-none"
        />
      </Card>

      {trimmed ? (
        <Card className="mt-4 p-4 sm:p-5">
          <p className="mb-2 text-xs font-extrabold tracking-wide text-muted uppercase">
            {results.length === 0
              ? "Niets gevonden"
              : `${results.length} ${results.length === 1 ? "resultaat" : "resultaten"}${
                  results.length === 100 ? "+" : ""
                }`}
          </p>
          <div>
            {results.map((w) => (
              <div key={wordKey(w)}>
                <WordRow word={w} mastered={isMastered(w)} />
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <>
          <Card className="mt-4 p-4 sm:p-5">
            <p className="mb-2 text-xs font-extrabold tracking-wide text-muted uppercase">
              Cursuslessen
            </p>
            <LessonChips lessons={COURSE_LESSONS} selected={selected} onSelect={setSelected} numeric />

            {BONUS_LESSONS.length > 0 && (
              <>
                <p className="mt-4 mb-2 text-xs font-extrabold tracking-wide text-muted uppercase">
                  Bonuspakketten
                </p>
                <LessonChips lessons={BONUS_LESSONS} selected={selected} onSelect={setSelected} />
              </>
            )}

            {SENTENCE_LESSONS.length > 0 && (
              <>
                <p className="mt-4 mb-2 text-xs font-extrabold tracking-wide text-muted uppercase">
                  Zinnen
                </p>
                <LessonChips lessons={SENTENCE_LESSONS} selected={selected} onSelect={setSelected} />
              </>
            )}
          </Card>

          <Card className="mt-4 p-4 sm:p-5">
            <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
              <h3 className="font-display text-lg font-semibold text-ink">{lessonTitle(selected)}</h3>
              <span className="text-sm font-bold text-muted">
                {lessonWords.length} {lessonWords.length === 1 ? "woord" : "woorden"}
              </span>
            </div>
            <div>
              {lessonWords.map((w) => (
                <div key={wordKey(w)}>
                  <WordRow word={w} mastered={isMastered(w)} />
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );
}
