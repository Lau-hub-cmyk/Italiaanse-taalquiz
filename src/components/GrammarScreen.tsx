import { motion } from "framer-motion";
import { useState } from "react";
import { GRAMMAR_BY_CATEGORY } from "../lib/grammar";
import { speak } from "../lib/speech";
import type { GrammarBlock, GrammarChapter } from "../lib/types";
import { BackBar, Card, SpeakerButton, spring } from "./ui";

function BlockView({ block }: { block: GrammarBlock }) {
  if (block.kind === "text") {
    return <p className="text-[15px] leading-relaxed font-semibold text-ink">{block.body}</p>;
  }

  if (block.kind === "tip") {
    return (
      <div className="flex gap-2.5 rounded-2xl border-2 border-citrus bg-citrus-soft px-4 py-3">
        <span aria-hidden className="text-lg">💡</span>
        <p className="text-sm leading-relaxed font-bold text-ink">{block.body}</p>
      </div>
    );
  }

  if (block.kind === "examples") {
    return (
      <div className="flex flex-col gap-2">
        {block.items.map((ex, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border-2 border-line bg-raised px-4 py-2.5"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-display text-base font-semibold text-ink">{ex.it}</span>
              <span className="block text-sm font-bold text-muted">{ex.nl}</span>
            </span>
            <SpeakerButton onClick={() => speak(ex.it, "it-IT")} label={`Spreek ${ex.it} uit`} />
          </div>
        ))}
      </div>
    );
  }

  // table
  return (
    <figure className="m-0">
      {block.caption && (
        <figcaption className="mb-2 text-xs font-extrabold tracking-wide text-muted uppercase">
          {block.caption}
        </figcaption>
      )}
      <div className="overflow-x-auto scrollbar-thin rounded-2xl border-2 border-line">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-raised">
              {block.head.map((h, i) => (
                <th
                  key={i}
                  className="whitespace-nowrap px-3 py-2 font-display text-sm font-bold text-ink"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, r) => (
              <tr key={r} className="border-t-2 border-line">
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={`whitespace-nowrap px-3 py-2 ${
                      c === 0 ? "font-extrabold text-muted" : "font-semibold text-ink"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

function ChapterDetail({
  chapter,
  onBack,
}: {
  chapter: GrammarChapter;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6"
    >
      <BackBar title={chapter.title} onBack={onBack} />
      <p className="-mt-2 mb-4 text-sm font-bold text-muted">{chapter.summary}</p>
      <Card className="flex flex-col gap-4 p-5 sm:p-6">
        {chapter.blocks.map((block, i) => (
          <BlockView key={i} block={block} />
        ))}
      </Card>
    </motion.div>
  );
}

export function GrammarScreen({ onBack }: { onBack: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const open = openId
    ? GRAMMAR_BY_CATEGORY.flatMap((g) => g.chapters).find((c) => c.id === openId)
    : undefined;

  if (open) {
    return <ChapterDetail chapter={open} onBack={() => setOpenId(null)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6"
    >
      <BackBar title="Grammatica" onBack={onBack} />

      <div className="flex flex-col gap-5">
        {GRAMMAR_BY_CATEGORY.map(({ category, chapters }) => (
          <div key={category}>
            <p className="mb-2 text-xs font-extrabold tracking-wide text-muted uppercase">
              {category}
            </p>
            <div className="flex flex-col gap-2">
              {chapters.map((c, i) => (
                <motion.button
                  key={c.id}
                  type="button"
                  onClick={() => setOpenId(c.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: i * 0.04 }}
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-3 rounded-[24px] border-2 border-line border-b-4 bg-surface p-4 text-left transition-[transform,border-width] duration-75 active:translate-y-[3px] active:border-b-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-base font-bold text-ink">
                      {c.title}
                    </span>
                    <span className="block text-sm font-bold text-muted">{c.summary}</span>
                  </span>
                  <span className="text-2xl font-bold text-muted opacity-50">›</span>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
