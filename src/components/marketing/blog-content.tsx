"use client"

import Link from "next/link"
import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ArrowRight, Search, X } from "lucide-react"
import { articles, allCategories, categoryColors, searchArticles, type BlogArticle } from "@/lib/blog-data"
import { ArticleImage } from "./blog/article-image"
import { ArticleMetadata } from "./blog/article-metadata"

const ARTICLES_PER_PAGE = 9

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

export function BlogContent() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { ref: heroRef, visible: heroVis } = useReveal()
  const { ref: filtersRef, visible: filtersVis } = useReveal()
  const { ref: featuredRef, visible: featuredVis } = useReveal(0.1)

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(value)
      setVisibleCount(ARTICLES_PER_PAGE)
    }, 300)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setDebouncedQuery("")
    setVisibleCount(ARTICLES_PER_PAGE)
  }, [])

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  const filtered = searchArticles(debouncedQuery, activeCategory)
  const featured = articles[0]
  const showFeatured = activeCategory === "All" && !debouncedQuery
  const gridPosts = showFeatured ? filtered.filter((a) => a.slug !== featured.slug) : filtered
  const visiblePosts = gridPosts.slice(0, visibleCount)
  const hasMore = visibleCount < gridPosts.length
  const allLoaded = !hasMore

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat)
    setVisibleCount(ARTICLES_PER_PAGE)
  }, [])

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ARTICLES_PER_PAGE)
  }, [])

  return (
    <section className="pt-8 pb-16 md:pt-12 md:pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Hero ─── */}
        <div
          ref={heroRef}
          className={cn("mx-auto max-w-2xl text-center mb-10 reveal", heroVis && "visible")}
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Thoughts on purpose, habits, reflection, and living intentionally.
          </p>
        </div>

        {/* ─── Search ─── */}
        <div
          ref={filtersRef}
          className={cn("mx-auto max-w-3xl mb-8 reveal", filtersVis && "visible")}
        >
          <div className="relative rounded-xl gradient-border-animated">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search articles..."
              aria-label="Search blog articles"
              className={cn(
                "w-full rounded-xl bg-white dark:bg-card pl-11 pr-10 py-3 text-sm",
                "placeholder:text-muted-foreground focus:outline-none",
                "transition-all duration-200"
              )}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#1E0E6B]/5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ─── Category Filters ─── */}
        <div className="mx-auto max-w-3xl mb-12">
          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-250 relative z-[1]",
                  activeCategory === cat
                    ? "bg-[#1E0E6B] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#1E0E6B]/[0.02]"
                )}
                style={
                  activeCategory !== cat
                    ? {
                        background: "white",
                        border: "2px solid transparent",
                        backgroundImage: "linear-gradient(white, white), linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)",
                        backgroundOrigin: "border-box",
                        backgroundClip: "padding-box, border-box",
                      }
                    : undefined
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Featured Article ─── */}
        {showFeatured && (
          <div
            ref={featuredRef}
            className={cn("mx-auto max-w-4xl mb-14 reveal", featuredVis && "visible")}
          >
            <Link
              href={`/blog/${featured.slug}`}
              className="group block rounded-3xl border border-[#1E0E6B]/10 bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730] dark:border-[#1E0E6B]/15 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#1E0E6B]/[0.06] hover:-translate-y-1"
            >
              <div className="grid lg:grid-cols-5 gap-0">
                {/* Image */}
                <div className="lg:col-span-2 relative h-48 lg:h-auto">
                  <ArticleImage
                    src={featured.image}
                    alt={featured.imageAlt}
                    title={featured.title}
                    category={featured.category}
                    className="rounded-none lg:rounded-l-3xl rounded-t-3xl lg:rounded-tr-none aspect-auto lg:aspect-auto h-full"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#EB9E5B]">
                      Featured
                    </span>
                    <ArticleMetadata
                      category={featured.category}
                      date={featured.date}
                      readTime={featured.readTime}
                      size="sm"
                    />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground group-hover:text-[#1E0E6B] transition-colors duration-300 leading-snug">
                    {featured.title}
                  </h2>

                  <p className="mt-3 text-base text-muted-foreground leading-relaxed line-clamp-2">
                    {featured.excerpt}
                  </p>

                  <div className="mt-5">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E0E6B] group-hover:gap-2.5 transition-all duration-300">
                      Read Article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ─── Article Grid ─── */}
        <div className="mx-auto max-w-5xl">
          {debouncedQuery && filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg font-semibold text-foreground mb-2">No articles found</p>
              <p className="text-muted-foreground text-sm mb-6">
                Try searching for another topic or explore one of the categories below.
              </p>
              <div className="flex items-center gap-2 justify-center flex-wrap">
                {allCategories.filter((c) => c !== "All").map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { handleCategoryChange(cat); clearSearch(); }}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 border",
                      "bg-white text-muted-foreground border-[#1E0E6B]/10 hover:border-[#1E0E6B]/25 hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePosts.map((post, i) => (
              <BlogCard key={post.slug} post={post} index={i} />
            ))}
          </div>

          {/* ─── Load More ─── */}
          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={loadMore}
                className="inline-flex items-center justify-center rounded-xl border border-[#1E0E6B]/15 px-8 py-3 text-sm font-semibold text-[#1E0E6B] hover:bg-[#1E0E6B]/5 transition-all duration-200"
              >
                Load More Articles
              </button>
            </div>
          )}

          {allLoaded && gridPosts.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                You&apos;ve reached the end.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ─── Blog Card Component ─── */
function BlogCard({ post, index }: { post: BlogArticle; index: number }) {
  const { ref, visible } = useReveal(0.05)

  return (
    <div
      ref={ref}
      className={cn(
        "reveal",
        visible && "visible"
      )}
      style={{ transitionDelay: `${Math.min(index * 60, 300)}ms` }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group block h-full rounded-2xl border border-[#1E0E6B]/10 bg-white dark:bg-card overflow-hidden text-left transition-all duration-300 hover:shadow-lg hover:shadow-[#1E0E6B]/[0.06] hover:-translate-y-1 hover:border-[#1E0E6B]/20"
      >
        {/* Image */}
        <div className="relative">
          <ArticleImage
            src={post.image}
            alt={post.imageAlt}
            title={post.title}
            category={post.category}
            className="rounded-none rounded-t-2xl aspect-[16/9]"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <ArticleMetadata
            category={post.category}
            date={post.date}
            readTime={post.readTime}
            size="sm"
            className="mb-3"
          />

          <h3 className="text-lg font-bold text-foreground group-hover:text-[#1E0E6B] transition-colors duration-300 leading-snug line-clamp-2">
            {post.title}
          </h3>

          <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>

          <div className="mt-4">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1E0E6B] opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300">
              Read <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
