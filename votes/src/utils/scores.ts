import { config } from './config'

export const scoresToRanking = (
  scores: Record<string, number>,
  epsilon = config.EPSILON,
): string[][] => {
  const buckets: { score: number; candidates: string[] }[] = []
  for (const [c, score] of Object.entries(scores)) {
    const bucket = buckets.find((b) => Math.abs(b.score - score) <= epsilon)
    if (bucket) bucket.candidates.push(c)
    else buckets.push({ score, candidates: [c] })
  }
  return buckets.toSorted((a, b) => b.score - a.score).map((b) => b.candidates)
}
