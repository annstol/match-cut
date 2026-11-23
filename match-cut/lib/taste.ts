export type Scores = Record<string, number | null>;
export type Viewer = { id: string; name: string; color: string; bio: string; demo: boolean; ratings: Scores };

export const minimumOverlap = 5;

export function findMatches(own: Scores, viewers: Viewer[]) {
  return viewers.flatMap((viewer) => {
    const shared = Object.entries(own).flatMap(([filmId, score]) => {
      const theirs = viewer.ratings[filmId];
      return score != null && theirs != null ? [{ filmId, own: score, theirs }] : [];
    });
    if (shared.length < minimumOverlap) return [];
    const agreement = 1 - shared.reduce((sum, pair) => sum + Math.abs(pair.own - pair.theirs), 0) / (4 * shared.length);
    const strength = (agreement * shared.length + 1) / (shared.length + 2);
    return [{ ...viewer, ratings: undefined, shared, strength, percent: Math.round(strength * 100) }];
  }).sort((a, b) => b.strength - a.strength || b.shared.length - a.shared.length || a.name.localeCompare(b.name))
    .filter((match) => match.strength >= 0.55).slice(0, 6);
}

export function buildResults(own: Scores, viewers: Viewer[]) {
  const matches = findMatches(own, viewers);
  const picks = new Map<string, { name: string; score: number; weight: number }[]>();
  for (const match of matches.slice(0, 3)) {
    const viewer = viewers.find((candidate) => candidate.id === match.id)!;
    for (const [filmId, score] of Object.entries(viewer.ratings)) {
      if (Object.hasOwn(own, filmId) || score == null) continue;
      const votes = picks.get(filmId) ?? [];
      votes.push({ name: viewer.name, score, weight: (match.strength - 0.5) ** 2 });
      picks.set(filmId, votes);
    }
  }
  const recommendations = [...picks].flatMap(([filmId, votes]) => {
    const fans = votes.filter((vote) => vote.score >= 4);
    const total = votes.reduce((sum, vote) => sum + vote.weight, 0);
    const score = votes.reduce((sum, vote) => sum + vote.score * vote.weight, 0) / total;
    if (!fans.length || score < 3.75) return [];
    const rank = score + 0.2 * (fans.length - 1) + 0.2 * Math.max(...fans.map((fan) => fan.weight));
    return [{ filmId, score, rank, fans: fans.map(({ name, score }) => ({ name, score })) }];
  }).sort((a, b) => b.rank - a.rank || a.filmId.localeCompare(b.filmId)).slice(0, 30);
  return { matches, recommendations };
}

export type Results = ReturnType<typeof buildResults>;
