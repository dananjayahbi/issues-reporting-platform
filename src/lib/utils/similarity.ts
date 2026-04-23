/**
 * Text similarity utilities for duplicate issue detection.
 * Uses Jaccard similarity coefficient on word n-grams.
 */

const DEFAULT_NGRAM_SIZE = 3;
const DEFAULT_SIMILARITY_THRESHOLD = 0.6;

/**
 * Tokenize text into word n-grams
 */
function getNGrams(text: string, n = DEFAULT_NGRAM_SIZE): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  const ngrams = new Set<string>();
  for (const word of words) {
    for (let i = 0; i <= word.length - n; i++) {
      ngrams.add(word.slice(i, i + n));
    }
  }
  return ngrams;
}

/**
 * Compute Jaccard similarity coefficient between two sets
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * Calculate similarity score between two text strings.
 * Returns a value between 0 (completely different) and 1 (identical).
 */
export function calculateSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;
  const ngramsA = getNGrams(textA);
  const ngramsB = getNGrams(textB);
  return jaccardSimilarity(ngramsA, ngramsB);
}

/**
 * Check if two texts are likely duplicates based on the threshold.
 */
export function areSimilar(textA: string, textB: string, threshold = DEFAULT_SIMILARITY_THRESHOLD): boolean {
  return calculateSimilarity(textA, textB) >= threshold;
}

/**
 * Find the most similar text from a list of candidates.
 * Returns the index of the most similar candidate and the similarity score.
 */
export function findMostSimilar(
  query: string,
  candidates: Array<{ id: string; title: string; body?: string }>
): { id: string; score: number } | null {
  if (!query || candidates.length === 0) return null;

  let bestId = candidates[0]?.id ?? "";
  let bestScore = 0;

  for (const candidate of candidates) {
    const combinedText = `${candidate.title} ${candidate.body || ""}`;
    const score = calculateSimilarity(query, combinedText);
    if (score > bestScore) {
      bestScore = score;
      bestId = candidate.id;
    }
  }

  if (bestScore < DEFAULT_SIMILARITY_THRESHOLD) return null;
  return { id: bestId, score: bestScore };
}
