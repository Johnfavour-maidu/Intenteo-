import Fuse from "fuse.js"
import type { BlogArticle } from "./blog-data"

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

interface SearchResult {
  article: BlogArticle
  score: number
}

const TITLE_WEIGHTS: Record<string, number> = {}
const CATEGORY_WEIGHTS: Record<string, number> = {}
const TAG_WEIGHTS: Record<string, number> = {}

let fuseInstance: Fuse<BlogArticle> | null = null

function getFuse(articles: BlogArticle[]): Fuse<BlogArticle> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(articles, {
      keys: [
        { name: "title", weight: 0.35 },
        { name: "category", weight: 0.2 },
        { name: "tags", weight: 0.2 },
        { name: "excerpt", weight: 0.15 },
        { name: "content", weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
      findAllMatches: true,
    })
  }
  return fuseInstance
}

export function searchArticlesSmart(
  query: string,
  articles: BlogArticle[],
  category: string = "All"
): BlogArticle[] {
  const normalizedQuery = normalize(query)

  if (!normalizedQuery) {
    if (category === "All") return articles
    return articles.filter((a) => a.category === category)
  }

  const words = filterStopWords(normalizedQuery.split(" "))

  if (words.length === 0) {
    if (category === "All") return articles
    return articles.filter((a) => a.category === category)
  }

  const fuse = getFuse(articles)
  const fuseResults = fuse.search(normalizedQuery)

  const scored = new Map<string, number>()

  for (const result of fuseResults) {
    const slug = result.item.slug
    const fuseScore = 1 - (result.score ?? 0.5)
    scored.set(slug, fuseScore * 60)
  }

  for (const article of articles) {
    const slug = article.slug
    const titleLower = article.title.toLowerCase()
    const excerptLower = article.excerpt.toLowerCase()
    const catLower = article.category.toLowerCase()
    const contentJoined = article.content.join(" ").toLowerCase()
    const tagsJoined = article.tags.join(" ").toLowerCase()

    let score = scored.get(slug) ?? 0

    if (titleLower === normalizedQuery) {
      score += 100
    } else if (titleLower.includes(normalizedQuery)) {
      score += 70
    }

    for (const word of words) {
      if (titleLower.includes(word)) score += 15
      if (excerptLower.includes(word)) score += 8
      if (catLower.includes(word)) score += 20
      if (tagsJoined.includes(word)) score += 12
      if (contentJoined.includes(word)) score += 4
    }

    const exactPhraseInContent = contentJoined.includes(normalizedQuery)
    if (exactPhraseInContent) score += 15

    const matchedWords = words.filter(
      (w) =>
        titleLower.includes(w) ||
        excerptLower.includes(w) ||
        tagsJoined.includes(w) ||
        contentJoined.includes(w)
    )
    const matchRatio = matchedWords.length / words.length
    score += matchRatio * 25

    if (score > 0) {
      scored.set(slug, score)
    }
  }

  const results: SearchResult[] = []
  for (const article of articles) {
    const score = scored.get(article.slug) ?? 0
    if (score > 5) {
      results.push({ article, score })
    }
  }

  results.sort((a, b) => b.score - a.score)

  let filtered = results.map((r) => r.article)

  if (category !== "All") {
    const categoryResults = filtered.filter((a) => a.category === category)
    const otherResults = filtered.filter((a) => a.category !== category)
    const boostedOther = otherResults.filter((a) => {
      const score = scored.get(a.slug) ?? 0
      return score > 20
    })
    filtered = [...categoryResults, ...boostedOther]
  }

  return filtered
}

export function highlightText(text: string, query: string): string {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return text

  const words = filterStopWords(normalizedQuery.split(" "))
  if (words.length === 0) return text

  let result = text
  for (const word of words) {
    const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    result = result.replace(regex, '<mark class="bg-[#EB9E5B]/20 text-foreground rounded-sm px-0.5">$1</mark>')
  }
  return result
}
