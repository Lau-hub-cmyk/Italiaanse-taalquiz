import { motion } from "framer-motion";
import { WORDS } from "../lib/words";
import { GRAMMAR } from "../lib/grammar";
import { spring } from "./ui";

type Tone = "pino" | "cobalt" | "lilac";

const TONES: Record<Tone, string> = {
  pino: "bg-pino-soft border-pino text-pino-deep",
  cobalt: "bg-cobalt-soft border-cobalt text-cobalt-deep",
  lilac: "bg-lilac-soft border-lilac text-lilac-deep",
};

function Tile({
  emoji,
  title,
  sub,
  tone,
  onClick,
  index,
}: {
  emoji: string;
  title: string;
  sub: string;
  tone: Tone;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.05 + index * 0.06 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={`flex w-full items-center gap-4 rounded-[28px] border-2 border-b-[6px] p-5 text-left transition-[transform,border-width] duration-75 active:translate-y-[3px] active:border-b-2 ${TONES[tone]}`}
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface text-3xl">
        {emoji}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-xl font-bold text-ink">{title}</span>
        <span className="block text-sm font-bold text-muted">{sub}</span>
      </span>
      <span className="ml-auto text-2xl font-bold opacity-40">›</span>
    </motion.button>
  );
}

export function Home({
  onPractice,
  onLibrary,
  onGrammar,
}: {
  onPractice: () => void;
  onLibrary: () => void;
  onGrammar: () => void;
}) {
  const wordCount = WORDS.filter((w) => w.t !== "sentence").length;
  const sentenceCount = WORDS.filter((w) => w.t === "sentence").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28 }}
      className="mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6"
    >
      <div className="py-8 text-center">
        <motion.h1
          className="font-display text-4xl leading-tight font-bold text-balance text-ink sm:text-5xl"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring}
        >
          Impariamo{" "}
          <motion.span
            className="inline-block text-cobalt"
            animate={{ rotate: [0, -2.5, 2.5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            l'italiano!
          </motion.span>
        </motion.h1>
        <p className="mt-2 text-sm font-bold text-muted">
          {wordCount} woorden, {sentenceCount} zinnen en {GRAMMAR.length} grammaticahoofdstukken
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Tile
          index={0}
          emoji="🎯"
          title="Oefenen"
          sub="Woorden en zinnen quizzen"
          tone="pino"
          onClick={onPractice}
        />
        <Tile
          index={1}
          emoji="📖"
          title="Woordenlijst"
          sub="Alle woorden per les, met vertaling"
          tone="cobalt"
          onClick={onLibrary}
        />
        <Tile
          index={2}
          emoji="📐"
          title="Grammatica"
          sub="Uitleg over vervoegingen, lidwoorden en meer"
          tone="lilac"
          onClick={onGrammar}
        />
      </div>
    </motion.div>
  );
}
