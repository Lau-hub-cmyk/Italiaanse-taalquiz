import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Background } from "./components/Background";
import { TopBar } from "./components/TopBar";
import { Home } from "./components/Home";
import { SetupScreen } from "./components/SetupScreen";
import { QuizScreen } from "./components/QuizScreen";
import { ResultScreen } from "./components/ResultScreen";
import { StatsScreen } from "./components/StatsScreen";
import { LibraryScreen } from "./components/LibraryScreen";
import { GrammarScreen } from "./components/GrammarScreen";
import { ExerciseScreen } from "./components/ExerciseScreen";
import { HandsFreeMode } from "./components/HandsFreeMode";
import { useProgress } from "./hooks";
import { getProgress, recordSession, update } from "./lib/storage";
import { buildQuestions, requeue, shuffle } from "./lib/quiz";
import { WORDS } from "./lib/words";
import { grammarChapter } from "./lib/grammar";
import { EXERCISES, exercisesForChapter } from "./lib/exercises";
import type { Attempt, GrammarExercise, Options, Question, Word } from "./lib/types";

type Screen =
  | "home"
  | "setup"
  | "quiz"
  | "result"
  | "stats"
  | "library"
  | "grammar"
  | "exercise"
  | "handsfree";

/** Deep-link: #uitleg=<hoofdstuk-id> opent de grammatica op dat hoofdstuk (nieuw tabblad vanuit een oefening). */
function deepLinkChapter(): string | null {
  if (typeof window === "undefined") return null;
  const h = window.location.hash;
  return h.startsWith("#uitleg=") ? decodeURIComponent(h.slice("#uitleg=".length)) : null;
}

const DEFAULTS: Options = {
  lessons: [1],
  direction: "it2nl",
  style: "mcq",
  mode: "practice",
  count: 20,
  mixReview: true,
  audio: true,
};

export default function App() {
  const progress = useProgress();
  const [deepChapter] = useState(deepLinkChapter);
  const [screen, setScreen] = useState<Screen>(deepChapter ? "grammar" : "home");
  const [exerciseSet, setExerciseSet] = useState<{
    exercises: GrammarExercise[];
    title: string;
  } | null>(null);
  const [handsFree, setHandsFree] = useState<{ words: Word[]; sub: "listen" | "speak" } | null>(
    null,
  );
  const [options, setOptionsState] = useState<Options>(() => ({
    ...DEFAULTS,
    ...getProgress().options,
  }));
  const [questions, setQuestions] = useState<Question[]>([]);
  const [finished, setFinished] = useState<{ attempts: Attempt[]; seconds: number }>({
    attempts: [],
    seconds: 0,
  });

  // Thema hangt aan <html>, zodat de achtergrond ook meekleurt.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", progress.theme === "dark");
  }, [progress.theme]);

  const setOptions = useCallback((patch: Partial<Options>) => {
    setOptionsState((prev) => {
      const next = { ...prev, ...patch };
      update((p) => ({ ...p, options: next }));
      return next;
    });
  }, []);

  const start = useCallback(
    (overrides?: Partial<Options>) => {
      const opts = { ...options, ...overrides };
      const built = buildQuestions(opts, getProgress().words);
      if (built.length === 0) return;
      setQuestions(built);
      setScreen("quiz");
    },
    [options],
  );

  const startHandsFree = useCallback(
    (sub: "listen" | "speak") => {
      const lessons = new Set(options.lessons);
      let words = shuffle(WORDS.filter((w) => lessons.has(w.l)));
      if (options.count > 0) words = words.slice(0, options.count);
      if (words.length === 0) return;
      setHandsFree({ words, sub });
      setScreen("handsfree");
    },
    [options],
  );

  const handleFinish = useCallback(
    (attempts: Attempt[], seconds: number) => {
      setFinished({ attempts, seconds });
      recordSession({
        at: Date.now(),
        mode: options.mode,
        lessons: options.lessons,
        correct: attempts.filter((a) => a.verdict === "correct").length,
        total: attempts.length,
        seconds,
      });
      setScreen("result");
    },
    [options],
  );

  const pool = useMemo(() => {
    const lessons = new Set(options.lessons);
    return WORDS.filter((w) => lessons.has(w.l));
  }, [options.lessons]);

  const drillMistakes = useCallback(() => {
    // Alleen elk fout woord één keer, in nieuwe volgorde en met verse opties.
    const seen = new Set<string>();
    const redo: Question[] = [];
    for (const a of finished.attempts) {
      if (a.verdict === "correct") continue;
      const key = a.question.word.it + a.question.direction;
      if (seen.has(key)) continue;
      seen.add(key);
      redo.push(requeue(a.question, pool));
    }
    if (redo.length === 0) return;
    setQuestions(shuffle(redo));
    setScreen("quiz");
  }, [finished.attempts, options, pool]);

  return (
    <div className="relative min-h-full text-ink">
      <Background />

      <div className="relative">
        {screen !== "quiz" && (
          <TopBar
            progress={progress}
            onOpenStats={() => setScreen("stats")}
            onHome={() => setScreen("home")}
          />
        )}

        <AnimatePresence mode="wait">
          {screen === "home" && (
            <Home
              key="home"
              onPractice={() => setScreen("setup")}
              onLibrary={() => setScreen("library")}
              onGrammar={() => setScreen("grammar")}
            />
          )}

          {screen === "setup" && (
            <SetupScreen
              key="setup"
              options={options}
              setOptions={setOptions}
              progress={progress}
              onStart={() => start()}
              onBack={() => setScreen("home")}
              onStartHandsFree={startHandsFree}
            />
          )}

          {screen === "library" && (
            <LibraryScreen key="library" progress={progress} onBack={() => setScreen("home")} />
          )}

          {screen === "grammar" && (
            <GrammarScreen
              key="grammar"
              onBack={() => setScreen("home")}
              initialChapterId={deepChapter ?? undefined}
              onPracticeAll={() => {
                setExerciseSet({ exercises: EXERCISES, title: "Grammatica oefenen" });
                setScreen("exercise");
              }}
              onPracticeChapter={(id) => {
                setExerciseSet({
                  exercises: exercisesForChapter(id),
                  title: `Oefenen: ${grammarChapter(id)?.title ?? "hoofdstuk"}`,
                });
                setScreen("exercise");
              }}
            />
          )}

          {screen === "exercise" && exerciseSet && (
            <ExerciseScreen
              key="exercise"
              exercises={exerciseSet.exercises}
              title={exerciseSet.title}
              onBack={() => setScreen("grammar")}
            />
          )}

          {screen === "handsfree" && handsFree && (
            <HandsFreeMode
              key="handsfree"
              words={handsFree.words}
              subMode={handsFree.sub}
              onQuit={() => setScreen("setup")}
            />
          )}

          {screen === "quiz" && (
            <QuizScreen
              key="quiz"
              questions={questions}
              options={options}
              audio={progress.audio}
              onFinish={handleFinish}
              onQuit={() => setScreen("setup")}
            />
          )}

          {screen === "result" && (
            <ResultScreen
              key="result"
              attempts={finished.attempts}
              seconds={finished.seconds}
              onRetry={() => start()}
              onDrillMistakes={drillMistakes}
              onHome={() => setScreen("home")}
            />
          )}

          {screen === "stats" && (
            <StatsScreen key="stats" progress={progress} onBack={() => setScreen("home")} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
