/**
 * Dunne wrapper rond de Web Speech API voor spraakherkenning (STT).
 * Werkt vooral in Chrome/Edge (op Android). In Safari/iOS is er nauwelijks
 * ondersteuning, dus detecteer dat en val terug op de luistermodus.
 *
 * De browser-typen voor SpeechRecognition zijn niet standaard aanwezig, dus
 * gebruiken we hier bewust `any`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type RecognitionResult = { transcript: string; isFinal: boolean };

function getRecognitionCtor(): any {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export class ItalianSpeechListener {
  private recognition: any = null;
  private stopped = false;
  private onResult: (r: RecognitionResult) => void;
  private onEnd: () => void;

  constructor(onResult: (r: RecognitionResult) => void, onEnd: () => void) {
    this.onResult = onResult;
    this.onEnd = onEnd;
  }

  start() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      this.onEnd();
      return;
    }
    const recognition = new Ctor();
    recognition.lang = "it-IT";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      this.onResult({
        transcript: String(result[0].transcript ?? "").trim(),
        isFinal: result.isFinal !== false,
      });
    };
    recognition.onend = () => {
      if (!this.stopped) this.onEnd();
    };
    recognition.onerror = () => {
      if (!this.stopped) this.onEnd();
    };

    this.recognition = recognition;
    try {
      recognition.start();
    } catch {
      this.onEnd();
    }
  }

  stop() {
    this.stopped = true;
    try {
      this.recognition?.stop();
    } catch {
      // niets aan te doen
    }
    this.recognition = null;
  }
}
