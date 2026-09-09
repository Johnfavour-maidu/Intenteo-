import Fuse from "fuse.js"
import type { FaqItem } from "./faq-data"

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "its", "this", "that", "are",
  "was", "were", "be", "been", "being", "have", "has", "had", "do", "does",
  "did", "will", "would", "could", "should", "may", "might", "shall",
  "can", "not", "no", "nor", "so", "if", "then", "than", "too", "very",
  "just", "about", "above", "after", "again", "all", "also", "any", "as",
  "because", "before", "between", "both", "each", "few", "more", "most",
  "other", "some", "such", "into", "over", "own", "same", "through",
  "during", "out", "up", "down", "only", "now", "how", "what", "when",
  "where", "which", "who", "whom", "why", "your", "you", "we", "my",
  "me", "our", "their", "his", "her", "she", "he", "them", "those",
  "these", "here", "there", "am", "s", "t", "don", "re", "ve", "ll",
  "d", "m", "didn", "doesn", "hadn", "hasn", "haven", "isn", "wasn",
  "weren", "won", "wouldn", "couldn", "shouldn", "mustn", "needn",
  "ain", "aren", "ma",
])

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function filterStopWords(words: string[]): string[] {
  return words.filter((w) => w.length > 1 && !STOP_WORDS.has(w))
}

let fuseInstance: Fuse<FaqItem> | null = null

function getFuse(items: FaqItem[]): Fuse<FaqItem> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(items, {
      keys: [
        { name: "question", weight: 0.4 },
        { name: "category", weight: 0.2 },
        { name: "keywords", weight: 0.2 },
        { name: "answer", weight: 0.2 },
      ],
      threshold: 0.45,
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
      findAllMatches: true,
    })
  }
  return fuseInstance
}

export function searchFaqSmart(
  query: string,
  items: FaqItem[],
  category: string = "All"
): FaqItem[] {
  const normalizedQuery = normalize(query)

  if (!normalizedQuery) {
    if (category === "All") return items
    return items.filter((item) => item.category === category)
  }

  const words = filterStopWords(normalizedQuery.split(" "))

  if (words.length === 0) {
    if (category === "All") return items
    return items.filter((item) => item.category === category)
  }

  const fuse = getFuse(items)
  const fuseResults = fuse.search(normalizedQuery)

  const scored = new Map<string, number>()

  for (const result of fuseResults) {
    const id = result.item.id
    const fuseScore = 1 - (result.score ?? 0.5)
    scored.set(id, fuseScore * 60)
  }

  for (const item of items) {
    const id = item.id
    const questionLower = item.question.toLowerCase()
    const answerLower = item.answer.toLowerCase()
    const catLower = item.category.toLowerCase()
    const keywordsJoined = item.keywords.join(" ").toLowerCase()

    let score = scored.get(id) ?? 0

    if (questionLower === normalizedQuery) {
      score += 100
    } else if (questionLower.includes(normalizedQuery)) {
      score += 70
    }

    for (const word of words) {
      if (questionLower.includes(word)) score += 15
      if (catLower.includes(word)) score += 20
      if (keywordsJoined.includes(word)) score += 12
      if (answerLower.includes(word)) score += 4
    }

    const exactPhraseInAnswer = answerLower.includes(normalizedQuery)
    if (exactPhraseInAnswer) score += 15

    const matchedWords = words.filter(
      (w) =>
        questionLower.includes(w) ||
        catLower.includes(w) ||
        keywordsJoined.includes(w) ||
        answerLower.includes(w)
    )
    const matchRatio = matchedWords.length / words.length
    score += matchRatio * 25

    if (score > 0) {
      scored.set(id, score)
    }
  }

  const results: { item: FaqItem; score: number }[] = []
  for (const item of items) {
    const score = scored.get(item.id) ?? 0
    if (score > 5) {
      results.push({ item, score })
    }
  }

  results.sort((a, b) => b.score - a.score)

  let filtered = results.map((r) => r.item)

  if (category !== "All") {
    const categoryResults = filtered.filter((a) => a.category === category)
    const otherResults = filtered.filter((a) => a.category !== category)
    const boostedOther = otherResults.filter((a) => {
      const score = scored.get(a.id) ?? 0
      return score > 20
    })
    filtered = [...categoryResults, ...boostedOther]
  }

  return filtered
}

export function highlightFaqText(text: string, query: string): string {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return text

  const words = filterStopWords(normalizedQuery.split(" "))
  if (words.length === 0) return text

  let result = text
  for (const word of words) {
    const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    result = result.replace(
      regex,
      '<mark class="bg-[#EB9E5B]/20 text-foreground rounded-sm px-0.5">$1</mark>'
    )
  }
  return result
}
