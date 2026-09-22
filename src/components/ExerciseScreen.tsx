import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { judge } from "../lib/text";
import { sfx } from "../lib/sfx";
import { getProgress } from "../lib/storage";
import { grammarChapter } from "../lib/grammar";
import type { GrammarExercise } from "../lib/types";
import { BackBar, Button, Card, Chip } from "./ui";

type Mode = "type" | "choice";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function beep(kind: "correct" | "almost" | "wrong") {
  if (!getProgress().audio) return;
  if (kind === "correct") sfx.correct();
  else if (kind === "almost") sfx.almost();
  else sfx.wrong();
}

/** De losse antwoorden uit de hele set, om meerkeuze-afleiders aan te vullen. */
function pool(exercises: GrammarExercise[]): string[] {
  return [...new Set(exercises.map((e) => e.answer))];
}

function Sentence({
  prompt,
  slot,
}: {
  prompt: string;
  slot: React.ReactNode;
}) {
  const [before, after = ""] = prompt.split("___");
  return (
    <p className="font-display text-xl leading-relaxed font-semibold text-ink">
      {before}
      {slot}
      {after}
    </p>
  );
}

export function ExerciseScreen({
  exercises,
  title,
  onBack,
}: {
  exercises: GrammarExercise[];
  title: string;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [order] = useState(() => shuffle(exercises));
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [given, setGiven] = useState<string | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [score, setScore] = useState(0);

  const current = order[index];
  const allAnswers = useMemo(() => pool(exercises), [exercises]);

  // Meerkeuze-opties: antwoord + afleiders, aangevuld tot vier, gehusseld.
  const options = useMemo(() => {
    if (!current) return [];
    const set = [current.answer, ...(current.choices ?? [])];
    for (const cand of shuffle(allAnswers)) {
      if (set.length >= 4) break;
      if (!set.some((s) => s.toLowerCase() === cand.toLowerCase())) set.push(cand);
    }
    return shuffle(set.slice(0, 4));
  }, [current, allAnswers]);

  if (!current) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-2xl px-4 pb-16 sm:px-6"
      >
        <BackBar title={title} onBack={onBack} />
        <Card className="p-6 text-center">
          <p className="font-display text-lg font-bold text-ink">Geen oefeningen beschikbaar.</p>
        </Card>
      </motion.div>
    );
  }

  const chapter = grammarChapter(current.chapter);
  const verdict = given === null ? null : judge(given, current.answer).verdict;
  const note = given === null ? undefined : judge(given, current.answer).note;
  const done = index >= order.length - 1 && given !== null;

  function answer(value: string) {
    if (given !== null || !value.trim()) return;
    const v = judge(value, current.answer).verdict;
    beep(v);
    if (v !== "wrong") setScore((s) => s + 1);
    setGiven(value);
  }

  function next() {
    setGiven(null);
    setTyped("");
    setShowWhy(false);
    setIndex((i) => i + 1);
  }

  // Keuzescherm vooraf.
  if (mode === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-2xl px-4 pb-16 sm:px-6"
      >
        <BackBar title={title} onBack={onBack} />
        <Card className="p-6">
          <h3 className="font-display mb-1 text-lg font-semibold text-ink">Hoe wil je oefenen?</h3>
          <p className="mb-4 text-sm font-bold text-muted">
            {order.length} invuloefening{order.length === 1 ? "" : "en"}. Bij elk antwoord kun je
            met <span className="font-black">?</span> zien waarom het zo is.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={() => setMode("type")} className="!py-4">
              ⌨️ Typen
            </Button>
            <Button variant="soft" onClick={() => setMode("choice")} className="!py-4">
              🔘 Kiezen
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  const slot =
    given !== null ? (
      <span
        className={`mx-1 rounded-lg px-2 py-0.5 font-bold ${
          verdict === "wrong"
            ? "bg-vermilion-soft text-vermilion-deep"
            : "bg-pino-soft text-pino-deep"
        }`}
      >
        {current.answer}
      </span>
    ) : (
      <span className="mx-1 inline-block min-w-16 rounded-lg border-b-4 border-dashed border-edge px-2 text-center text-muted">
        &nbsp;?&nbsp;
      </span>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-2xl px-4 pb-16 sm:px-6"
    >
      <BackBar title={title} onBack={onBack} hint={`${index + 1} / ${order.length}`} />

      <Card className="p-5 sm:p-6">
        {current.nl && (
          <p className="mb-3 text-sm font-bold text-muted">{current.nl}</p>
        )}
        <Sentence prompt={current.prompt} slot={slot} />

        {/* Antwoordgedeelte */}
        {given === null ? (
          mode === "type" ? (
            <form
              className="mt-5 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                answer(typed);
              }}
            >
              <input
                autoFocus
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Vul in..."
                className="min-w-0 flex-1 rounded-2xl border-2 border-line bg-raised px-4 py-3 text-base font-bold text-ink placeholder:text-muted focus:border-cobalt focus:outline-none"
              />
              <Button type="submit" disabled={!typed.trim()}>
                Controleer
              </Button>
            </form>
          ) : (
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {options.map((opt) => (
                <Chip
                  key={opt}
                  onClick={() => answer(opt)}
                  className="!px-4 !py-3 !text-base"
                >
                  {opt}
                </Chip>
              ))}
            </div>
          )
        ) : (
          <div className="mt-5">
            <div
              className={`flex items-center gap-2 font-display text-lg font-bold ${
                verdict === "wrong" ? "text-vermilion-deep" : "text-pino-deep"
              }`}
            >
              {verdict === "wrong" ? "✗ Fout" : verdict === "almost" ? "≈ Bijna" : "✓ Goed"}
              {verdict === "wrong" && (
                <span className="text-sm font-bold text-muted">
                  jij: {given} → {current.answer}
                </span>
              )}
            </div>
            {note && <p className="mt-1 text-sm font-bold text-muted">{note}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowWhy((s) => !s)}
                aria-expanded={showWhy}
                className="grid size-10 place-items-center rounded-full bg-citrus-soft font-display text-lg font-black text-citrus-deep"
                title="Waarom is dit het antwoord?"
              >
                ?
              </button>
              {!done ? (
                <Button onClick={next} className="flex-1 sm:flex-none">
                  Volgende →
                </Button>
              ) : (
                <Button onClick={onBack} className="flex-1 sm:flex-none">
                  Klaar
                </Button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {showWhy && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-2xl border-2 border-citrus bg-citrus-soft px-4 py-3">
                    <p className="text-sm leading-relaxed font-bold text-ink">{current.why}</p>
                    {chapter && (
                      <a
                        href={`#uitleg=${current.chapter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-extrabold text-cobalt-deep underline"
                      >
                        → Lees de uitleg: {chapter.title} (nieuw tabblad)
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {done && given !== null && (
        <Card className="mt-4 p-5 text-center">
          <p className="font-display text-xl font-bold text-ink">
            {score} / {order.length} goed
          </p>
          <p className="mt-1 text-sm font-bold text-muted">Goed geoefend! 🎉</p>
        </Card>
      )}
    </motion.div>
  );
}
