"use client";

import Image from "next/image";
import type { Photo } from "@/lib/photo-data";

type PhotoCardProps = {
  photo: Photo;
  score: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const scoreToLabel = (score: number) => {
  if (score > 0.86) return "Hero candidate";
  if (score > 0.72) return "Strong pick";
  if (score > 0.6) return "Consider";
  return "Hold";
};

export const PhotoCard = ({ photo, score, isSelected, onToggle }: PhotoCardProps) => (
  <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
    <div className="relative aspect-[4/3] overflow-hidden">
      <Image
        src={photo.thumbnailUrl}
        alt={photo.title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition duration-700 group-hover:scale-[1.03]"
        priority={score > 0.9}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-95" />
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="rounded-full bg-blue-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow">
          {scoreToLabel(score)}
        </span>
        <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-800 shadow dark:bg-slate-800/80 dark:text-white">
          {(score * 100).toFixed(0)}%
        </span>
      </div>
      <button
        type="button"
        onClick={() => onToggle(photo.id)}
        className={`absolute right-4 top-4 inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
          isSelected
            ? "border-emerald-500 bg-emerald-500/90 text-white"
            : "border-white/80 bg-black/35 text-white hover:bg-black/50"
        }`}
      >
        {isSelected ? "Shortlisted" : "Select"}
      </button>
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between text-white">
        <div>
          <h3 className="text-lg font-semibold drop-shadow-sm">{photo.title}</h3>
          <p className="text-xs font-medium uppercase tracking-wide text-white/80">
            {photo.shotType} • {photo.mood}
          </p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-white/75">
          {formatDate(photo.capturedAt)}
        </span>
      </div>
    </div>
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-300">
        <span>{photo.location}</span>
        <span>{photo.faces === 0 ? "No faces" : `${photo.faces} faces`}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
        {photo.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            #{tag}
          </span>
        ))}
      </div>
      <div className="mt-auto grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-slate-50 px-2 py-2 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Sharpness
          </p>
          {(photo.metrics.sharpness * 100).toFixed(0)}%
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-2 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Emotion
          </p>
          {(photo.metrics.emotion * 100).toFixed(0)}%
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-2 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Client Fit
          </p>
          {(photo.metrics.clientRelevance * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  </article>
);
