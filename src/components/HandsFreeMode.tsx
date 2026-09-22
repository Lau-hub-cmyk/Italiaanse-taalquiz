import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Word } from "../lib/types";
import { judge } from "../lib/text";
import { sfx } from "../lib/sfx";
import { speakAsync, cancelSpeech } from "../lib/speech";
import { ItalianSpeechListener, isSpeechRecognitionSupported } from "../lib/speechRecognition";
import { getProgress } from "../lib/storage";
import { Button, Card } from "./ui";

type SubMode = "listen" | "speak";
type Phase = "nl" | "pause" | "it" | "listen";
type Kind = "correct" | "wrong" | "none";

export function HandsFreeMode({
  words,
  subMode,
  onQuit,
}: {
  words: Word[];
  subMode: SubMode;
  onQuit: () => void;
}) {
  const [mode, setMode] = useState<SubMode>(subMode);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("nl");
  const [result, setResult] = useState<Kind | null>(null);
  const [heard, setHeard] = useState("");

  const speakSupported = isSpeechRecognitionSupported();
  const current = words[index];
  const finished = index >= words.length;

  // De audio-lus: draait telkens één stap als de index verandert.
  useEffect(() => {
    if (!started || finished) {
      if (started && finished && getProgress().audio) sfx.finish();
      return;
    }
    let cancelled = false;
    const word = words[index];
    let listener: ItalianSpeechListener | null = null;
    let timer: number | undefined;
    let silence: number | undefined;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });
    const go = () => {
      if (!cancelled) setIndex((i) => i + 1);
    };

    async function run() {
      if (mode === "listen") {
        setResult(null);
        setPhase("nl");
        await speakAsync(word.nl, "nl-BE");
        if (cancelled) return;
        setPhase("pause");
        await wait(2500);
        if (cancelled) return;
        setPhase("it");
        await speakAsync(word.it, "it-IT");
        if (cancelled) return;
        await wait(1000);
        if (cancelled) return;
        go();
        return;
      }

      // Spreken, app kijkt na.
      setResult(null);
      setHeard("");
      setPhase("nl");
      await speakAsync(word.nl, "nl-BE");
      if (cancelled) return;
      setPhase("listen");

      let handled = false;
      const finish = async (kind: Kind) => {
        if (handled || cancelled) return;
        handled = true;
        window.clearTimeout(silence);
        listener?.stop();
        setResult(kind);
        if (getProgress().audio) {
          if (kind === "correct") sfx.correct();
          else if (kind === "wrong") sfx.wrong();
        }
        // Bij fout of geen antwoord het Italiaanse woord voorlezen, zodat je het toch leert.
        if (kind !== "correct") await speakAsync(word.it, "it-IT");
        else await wait(700);
        if (cancelled) return;
        go();
      };

      listener = new ItalianSpeechListener(
        (r) => {
          if (!r.isFinal || !r.transcript) return;
          setHeard(r.transcript);
          const v = judge(r.transcript, word.it).verdict;
          void finish(v === "wrong" ? "wrong" : "correct");
        },
        () => void finish("none"),
      );
      // Vangnet tegen stilte: na 9s toch door.
      silence = window.setTimeout(() => {
        listener?.stop();
        void finish("none");
      }, 9000);
      listener.start();
    }

    void run();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(silence);
      listener?.stop();
      cancelSpeech();
    };
  }, [index, started, mode, finished, words]);

  // Stoppen: alle audio en herkenning netjes afsluiten.
  const stopRef = useRef(onQuit);
  stopRef.current = onQuit;
  useEffect(() => () => cancelSpeech(), []);

  // Startscherm (nodig: microfoontoestemming en een tik om audio te mogen starten).
  if (!started) {
    const needsMic = mode === "speak";
    const speakBlocked = mode === "speak" && !speakSupported;
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 pb-16 sm:px-6"
      >
        <button
          type="button"
          onClick={onQuit}
          className="mt-5 self-start rounded-xl px-2 py-1 text-sm font-extrabold text-muted transition hover:text-ink"
        >
          ← Terug
        </button>
        <Card className="mt-6 p-6 text-center">
          <div className="text-5xl">{mode === "listen" ? "🎧" : "🎤"}</div>
          <h2 className="mt-3 font-display text-2xl font-bold text-ink">
            Hands-free: {mode === "listen" ? "luisteren en herhalen" : "spreken"}
          </h2>
          <p className="mt-2 text-sm font-bold text-muted">
            {mode === "listen"
              ? "De app leest het Nederlandse woord voor, wacht even, en leest dan de Italiaanse vertaling. Alleen luisteren en hardop meezeggen — je hoeft niet te kijken."
              : "De app leest het Nederlandse woord voor; jij zegt de Italiaanse vertaling hardop en de app kijkt het na. Bedoeld om te beluisteren, niet om naar te kijken."}
          </p>
          <p className="mt-3 rounded-2xl bg-citrus-soft px-4 py-2.5 text-sm font-bold text-citrus-deep">
            ⚠️ Zet dit klaar vóór je vertrekt. Onder het rijden alleen luisteren en meepraten.
          </p>
          <p className="mt-2 text-xs font-bold text-muted">{words.length} items</p>

          {speakBlocked ? (
            <div className="mt-5">
              <p className="mb-3 text-sm font-extrabold text-vermilion-deep">
                Spraakherkenning wordt niet ondersteund in deze browser (werkt het best in
                Chrome op Android).
              </p>
              <Button onClick={() => setMode("listen")} className="w-full !py-4">
                Doe in plaats daarvan “luisteren”
              </Button>
            </div>
          ) : (
            <Button onClick={() => setStarted(true)} className="mt-5 w-full !py-4 !text-lg">
              {needsMic ? "Geef microfoon vrij & start" : "Start"}
            </Button>
          )}
        </Card>
      </motion.div>
    );
  }

  // Eindscherm.
  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6"
      >
        <div className="text-6xl">🎉</div>
        <h2 className="mt-4 font-display text-3xl font-bold text-ink">Klaar!</h2>
        <p className="mt-2 text-sm font-bold text-muted">Je hebt alle {words.length} items gehad.</p>
        <Button onClick={onQuit} className="mt-6 !py-4 !text-lg">
          Naar het menu
        </Button>
      </motion.div>
    );
  }

  const resultColor =
    result === "correct"
      ? "text-pino-deep"
      : result === "wrong"
        ? "text-vermilion-deep"
        : "text-muted";

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 pb-10 sm:px-6">
      <div className="flex items-center gap-3 py-5">
        <span className="text-sm font-extrabold text-muted tabular-nums">
          {index + 1} / {words.length}
        </span>
        <span className="ml-auto text-sm font-extrabold text-muted">
          {mode === "listen" ? "🎧 luisteren" : "🎤 spreken"}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div>
          <p className="text-xs font-extrabold tracking-wide text-muted uppercase">Nederlands</p>
          <p className="mt-1 font-display text-3xl leading-tight font-bold text-balance text-ink sm:text-4xl">
            {current.nl}
          </p>
        </div>

        <motion.div
          key={phase}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-24"
        >
          {phase === "it" ? (
            <div>
              <p className="text-xs font-extrabold tracking-wide text-muted uppercase">Italiaans</p>
              <p className="mt-1 font-display text-3xl leading-tight font-bold text-cobalt sm:text-4xl">
                {current.it}
              </p>
            </div>
          ) : phase === "listen" ? (
            <div>
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto grid size-20 place-items-center rounded-full bg-vermilion-soft text-4xl"
              >
                🎤
              </motion.div>
              <p className="mt-3 text-sm font-bold text-muted">Zeg het in het Italiaans...</p>
              {heard && <p className="mt-1 text-sm font-bold text-ink">“{heard}”</p>}
            </div>
          ) : (
            <p className="font-display text-2xl font-bold text-muted">···</p>
          )}
        </motion.div>

        {result && (
          <p className={`font-display text-xl font-bold ${resultColor}`}>
            {result === "correct" ? "✓ Bravo!" : result === "wrong" ? `✗ ${current.it}` : `→ ${current.it}`}
          </p>
        )}
      </div>

      <Button
        variant="soft"
        onClick={onQuit}
        className="mt-6 w-full !border-vermilion-deep !bg-vermilion !py-5 !text-lg !text-on-accent"
      >
        ■ Stop
      </Button>
    </div>
  );
}
