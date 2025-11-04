"use client";

import { useMemo, useState } from "react";
import type { Photo } from "@/lib/photo-data";
import {
  buildPhotoRankings,
  type ClientProfile,
  type ScoringWeights,
} from "@/lib/scoring";
import { moodOptions, shotTypeOptions, locationOptions, tagOptions } from "@/lib/photo-data";
import { PhotoCard } from "./photo-card";

type DashboardClientProps = {
  photos: Photo[];
};

const defaultProfile: ClientProfile = {
  preferredMoods: ["Joyful", "Romantic"],
  requiredShots: ["Portrait", "Candid"],
  highlightTags: ["storytelling", "candids", "laughs"],
  minimumFaces: 1,
};

const defaultWeights: ScoringWeights = {
  technical: 40,
  storytelling: 35,
  clientAlignment: 25,
};

const percentile = (value: number) => Math.round(value * 100);

const weightLabels: Record<keyof ScoringWeights, string> = {
  technical: "Technical excellence",
  storytelling: "Storytelling & emotion",
  clientAlignment: "Client alignment",
};

export const DashboardClient = ({ photos }: DashboardClientProps) => {
  const [weights, setWeights] = useState(defaultWeights);
  const [profile, setProfile] = useState<ClientProfile>(defaultProfile);
  const [activeShotTypes, setActiveShotTypes] = useState<string[]>([]);
  const [activeMoods, setActiveMoods] = useState<string[]>([]);
  const [activeLocations, setActiveLocations] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const normalizedWeights = useMemo(() => {
    const total = weights.technical + weights.storytelling + weights.clientAlignment;
    return {
      technical: weights.technical / total,
      storytelling: weights.storytelling / total,
      clientAlignment: weights.clientAlignment / total,
    };
  }, [weights]);

  const rankedPhotos = useMemo(
    () => buildPhotoRankings(photos, normalizedWeights, profile),
    [photos, normalizedWeights, profile],
  );

  const filtered = useMemo(() => {
    const query = tagQuery.trim().toLowerCase();
    return rankedPhotos.filter(({ photo }) => {
      if (showSelectedOnly && !selectedIds.has(photo.id)) return false;
      if (activeShotTypes.length > 0 && !activeShotTypes.includes(photo.shotType)) return false;
      if (activeMoods.length > 0 && !activeMoods.includes(photo.mood)) return false;
      if (activeLocations.length > 0 && !activeLocations.includes(photo.location)) return false;

      if (query) {
        const matchesTag = photo.tags.some((tag) => tag.toLowerCase().includes(query));
        const matchesNotes = photo.clientNotes.some((note) =>
          note.toLowerCase().includes(query),
        );
        if (!matchesTag && !matchesNotes && !photo.title.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [
    rankedPhotos,
    activeShotTypes,
    activeMoods,
    activeLocations,
    tagQuery,
    showSelectedOnly,
    selectedIds,
  ]);

  const topCandidates = filtered.slice(0, 12);

  const hero = topCandidates[0];

  const shortlist = useMemo(
    () => photos.filter((photo) => selectedIds.has(photo.id)),
    [photos, selectedIds],
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const adjustWeight = (key: keyof ScoringWeights, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleProfileField = (key: keyof ClientProfile, value: string) => {
    setProfile((prev) => {
      const current = prev[key];
      if (!Array.isArray(current)) return prev;
      const set = new Set(current);
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      return {
        ...prev,
        [key]: Array.from(set),
      };
    });
  };

  const clearSelections = () => setSelectedIds(new Set());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#1e293b,_#020617_60%)]" />
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3rem] text-slate-400">
              Capture Curator
            </p>
            <h1 className="text-3xl font-semibold text-white lg:text-4xl">
              Intelligent Shoot Curation Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-slate-900/80 px-5 py-3 text-sm">
              <p className="text-[0.7rem] uppercase tracking-wide text-slate-400">
                Total frames analyzed
              </p>
              <p className="text-xl font-semibold text-white">{photos.length.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 px-5 py-3 text-sm text-emerald-300">
              <p className="text-[0.7rem] uppercase tracking-wide text-emerald-200/80">
                Ready for delivery
              </p>
              <p className="text-xl font-semibold text-emerald-100">
                {selectedIds.size.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[280px_1fr]">
        <section className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-white">Client Priorities</h2>
            <p className="mt-1 text-sm text-slate-400">
              Tune how the AI ranks images so the final gallery reflects the brief.
            </p>
            <div className="mt-6 space-y-6">
              {(Object.keys(weights) as Array<keyof ScoringWeights>).map((key) => (
                <div key={key}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white/90">{weightLabels[key]}</p>
                    <span className="text-sm text-slate-400">{weights[key]}%</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={70}
                    step={1}
                    value={weights[key]}
                    onChange={(event) => adjustWeight(key, Number(event.target.value))}
                    className="mt-2 w-full accent-blue-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Influence: {(normalizedWeights[key] * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-white">Client Preferences</h2>
            <p className="mt-1 text-sm text-slate-400">
              Keep the client-centered by prioritizing moods, shots, and storytelling tags.
            </p>
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Preferred Moods
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {moodOptions.map((mood) => {
                    const active = profile.preferredMoods.includes(mood);
                    return (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => toggleProfileField("preferredMoods", mood)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                          active
                            ? "border-blue-400/70 bg-blue-500/20 text-blue-100"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
                        }`}
                      >
                        {mood}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Must-Have Shot Types
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {shotTypeOptions.map((type) => {
                    const active = profile.requiredShots.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleProfileField("requiredShots", type)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                          active
                            ? "border-violet-400/70 bg-violet-500/20 text-violet-100"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Highlight Tags
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tagOptions.slice(0, 12).map((tag) => {
                    const active = profile.highlightTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleProfileField("highlightTags", tag)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                          active
                            ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-100"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Minimum Faces
                </p>
                <div className="mt-3 flex gap-2">
                  {[0, 1, 2, 4].map((value) => {
                    const active = profile.minimumFaces === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            minimumFaces: value,
                          }))
                        }
                        className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                          active
                            ? "border-emerald-400/70 bg-emerald-500/15 text-emerald-100"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
                        }`}
                      >
                        {value === 0 ? "No minimum" : `${value}+ faces`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-white">Exploration Filters</h2>
            <p className="mt-1 text-sm text-slate-400">
              Quickly isolate segments of the shoot to confirm coverage or dive deeper.
            </p>
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Shot Types
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {shotTypeOptions.map((type) => {
                    const active = activeShotTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setActiveShotTypes((prev) =>
                            prev.includes(type)
                              ? prev.filter((item) => item !== type)
                              : [...prev, type],
                          )
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                          active
                            ? "border-amber-400/70 bg-amber-500/20 text-amber-100"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mood
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {moodOptions.map((mood) => {
                    const active = activeMoods.includes(mood);
                    return (
                      <button
                        key={mood}
                        type="button"
                        onClick={() =>
                          setActiveMoods((prev) =>
                            prev.includes(mood) ? prev.filter((item) => item !== mood) : [...prev, mood],
                          )
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                          active
                            ? "border-sky-400/70 bg-sky-500/20 text-sky-100"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
                        }`}
                      >
                        {mood}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Locations
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {locationOptions.map((location) => {
                    const active = activeLocations.includes(location);
                    return (
                      <button
                        key={location}
                        type="button"
                        onClick={() =>
                          setActiveLocations((prev) =>
                            prev.includes(location)
                              ? prev.filter((item) => item !== location)
                              : [...prev, location],
                          )
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                          active
                            ? "border-rose-400/70 bg-rose-500/20 text-rose-100"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
                        }`}
                      >
                        {location}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tag or note search
                </label>
                <input
                  value={tagQuery}
                  onChange={(event) => setTagQuery(event.target.value)}
                  placeholder="Search: #storytelling, backlit, laughter..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/70 focus:bg-white/10"
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showSelectedOnly}
                    onChange={(event) => setShowSelectedOnly(event.target.checked)}
                    className="h-4 w-4 rounded border border-white/30 bg-slate-900 accent-emerald-400"
                  />
                  <span className="font-semibold text-white/90">Show shortlist only</span>
                </label>
                <button
                  type="button"
                  onClick={clearSelections}
                  className="text-xs font-semibold uppercase tracking-wide text-emerald-300 hover:text-emerald-200"
                >
                  Clear shortlist
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {hero && (
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl shadow-black/30">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,_1fr)_340px]">
                <div className="relative aspect-[5/3] overflow-hidden rounded-3xl border border-white/10 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hero.photo.url}
                    alt={hero.photo.title}
                    className="h-full w-full object-cover transition duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute left-6 bottom-6 right-6 flex items-end justify-between text-white drop-shadow">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.4rem] text-blue-200/90">
                        Highest match
                      </p>
                      <h2 className="text-3xl font-semibold lg:text-4xl">{hero.photo.title}</h2>
                      <p className="mt-1 text-sm text-blue-100/80">
                        {(hero.score * 100).toFixed(1)}% alignment • {hero.photo.location}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSelection(hero.photo.id)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                        selectedIds.has(hero.photo.id)
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-white/90 text-slate-900 hover:bg-white"
                      }`}
                    >
                      {selectedIds.has(hero.photo.id) ? "Shortlisted" : "Select hero"}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col justify-between space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3rem] text-slate-400">
                      Why it stands out
                    </p>
                    <ul className="mt-4 space-y-3 text-sm text-slate-200">
                      <li>
                        <span className="font-semibold text-white">Client alignment:</span>{" "}
                        {percentile(hero.photo.metrics.clientRelevance)} percentile within the shoot.
                      </li>
                      <li>
                        <span className="font-semibold text-white">Emotion capture:</span>{" "}
                        {percentile(hero.photo.metrics.emotion)} percentile storytelling warmth.
                      </li>
                      <li>
                        <span className="font-semibold text-white">Technical delivery:</span>{" "}
                        {percentile(hero.photo.metrics.sharpness)} percentile sharpness with balanced
                        exposure.
                      </li>
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                      <p className="text-[0.6rem] uppercase tracking-wide text-slate-400">Shot type</p>
                      <p className="mt-1 text-sm font-semibold text-white">{hero.photo.shotType}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                      <p className="text-[0.6rem] uppercase tracking-wide text-slate-400">Mood</p>
                      <p className="mt-1 text-sm font-semibold text-white">{hero.photo.mood}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                      <p className="text-[0.6rem] uppercase tracking-wide text-slate-400">
                        Faces visible
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {hero.photo.faces === 0 ? "No faces" : `${hero.photo.faces}`}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                      <p className="text-[0.6rem] uppercase tracking-wide text-slate-400">
                        Captured
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {new Date(hero.photo.capturedAt).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3rem] text-slate-400">
                      Tags responded to brief
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {hero.photo.tags.slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
                            profile.highlightTags.includes(tag)
                              ? "border-emerald-300/70 bg-emerald-400/20 text-emerald-100"
                              : "border-white/10 bg-white/5 text-slate-300"
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3rem] text-slate-400">
                  Smart shortlist
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  Top {topCandidates.length} recommendations
                </h2>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  Coverage: {filtered.length.toLocaleString()} frames ·{" "}
                  {((filtered.length / photos.length) * 100).toFixed(0)}% of catalog
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  Hero confidence: {hero ? (hero.score * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topCandidates.map(({ photo, score }) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  score={score}
                  isSelected={selectedIds.has(photo.id)}
                  onToggle={toggleSelection}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3rem] text-slate-400">
                  Final delivery control
                </p>
                <h2 className="text-2xl font-semibold text-white">Shortlist Summary</h2>
              </div>
              <div className="flex gap-2 text-xs text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  {selectedIds.size} selected
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  Avg. alignment:{" "}
                  {shortlist.length
                    ? (
                        (shortlist.reduce((acc, photo) => {
                          const entry = rankedPhotos.find((item) => item.photo.id === photo.id);
                          return acc + (entry?.score ?? 0);
                        }, 0) /
                          shortlist.length) *
                        100
                      ).toFixed(0)
                    : "0"}
                  %
                </span>
              </div>
            </div>
            {shortlist.length === 0 ? (
              <p className="mt-6 rounded-3xl border border-dashed border-white/20 bg-white/5 px-6 py-12 text-center text-sm text-slate-400">
                Select frames from the shortlist to prep a delivery-ready gallery for your client.
              </p>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {shortlist.slice(0, 9).map((photo) => {
                  const entry = rankedPhotos.find((item) => item.photo.id === photo.id);
                  const score = entry?.score ?? 0.5;
                  return (
                    <PhotoCard
                      key={`shortlist-${photo.id}`}
                      photo={photo}
                      score={score}
                      isSelected
                      onToggle={toggleSelection}
                    />
                  );
                })}
              </div>
            )}
            {shortlist.length > 9 && (
              <p className="mt-4 text-center text-sm text-slate-400">
                +{shortlist.length - 9} more shortlisted frames ready to send
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
