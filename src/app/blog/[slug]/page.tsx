import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { articles, getArticleBySlug, getRelatedArticles, categoryColors } from "@/lib/blog-data"
import { ReadingProgressBar } from "@/components/marketing/blog/reading-progress"
import { ShareControls } from "@/components/marketing/blog/share-controls"
import { ArticleImage } from "@/components/marketing/blog/article-image"
import { ArticleMetadata } from "@/components/marketing/blog/article-metadata"
import { ArticleCTA } from "@/components/marketing/blog/article-cta"
import { ArrowLeft, ArrowRight } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getArticleBySlug(slug)
  if (!post) return { title: "Post Not Found" }
  return {
    title: `${post.title} — Intenteó Blog`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} — Intenteó Blog`,
      description: post.excerpt,
      siteName: "Inteéntéo",
      images: post.image ? [{ url: post.image, width: 800, height: 450, alt: post.imageAlt || post.title }] : [],
    },
  }
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getArticleBySlug(slug)
  if (!post) notFound()

  const related = getRelatedArticles(slug, post.category)

  return (
    <MarketingLayout>
      <ReadingProgressBar targetId="article-content" />
      <article className="pt-6 pb-16 md:pt-8 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[720px]">
            {/* ─── Back link ─── */}
            <Link
              href="/blog"
              className="reveal reveal-delay-1 visible inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {/* ─── Article Header ─── */}
            <header className="mb-8">
              <ArticleMetadata
                category={post.category}
                date={post.date}
                readTime={post.readTime}
                size="md"
                className="reveal visible mb-5"
              />

              <h1 className="reveal reveal-delay-1 visible text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-foreground leading-[1.15]">
                {post.title}
              </h1>

              <p className="reveal reveal-delay-2 visible mt-4 text-lg text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>

              <div className="reveal reveal-delay-2 visible mt-6">
                <ShareControls title={post.title} url={`/blog/${post.slug}`} />
              </div>

              <div className="reveal reveal-delay-2 visible mt-8 h-px bg-border" />
            </header>

            {/* ─── Hero Image ─── */}
            {post.image && (
              <div className="reveal reveal-delay-3 visible mb-10">
                <ArticleImage
                  src={post.image}
                  alt={post.imageAlt}
                  title={post.title}
                  category={post.category}
                  priority
                />
              </div>
            )}

            {/* ─── Article Content ─── */}
            <div id="article-content" className="reveal reveal-delay-3 visible">
              {post.content.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-[17px] sm:text-lg text-foreground/80 leading-[1.8] mb-7"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* ─── Share Controls (bottom) ─── */}
            <div className="mt-10 pt-6 border-t border-border">
              <ShareControls title={post.title} url={`/blog/${post.slug}`} />
            </div>

            {/* ─── CTA ─── */}
            <ArticleCTA />
          </div>

          {/* ─── Related Articles ─── */}
          {related.length > 0 && (
            <div className="mx-auto max-w-[960px] mt-16">
              <div className="h-px bg-border mb-12" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8">
                You may also like
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="group block rounded-2xl border border-[#1E0E6B]/10 bg-white dark:bg-card overflow-hidden text-left transition-all duration-300 hover:shadow-lg hover:shadow-[#1E0E6B]/[0.06] hover:-translate-y-1 hover:border-[#1E0E6B]/20"
                  >
                    {/* Image */}
                    {rel.image && (
                      <div className="relative h-40 overflow-hidden">
                        <ArticleImage
                          src={rel.image}
                          alt={rel.imageAlt}
                          title={rel.title}
                          category={rel.category}
                          className="rounded-none rounded-t-2xl aspect-[16/9]"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <ArticleMetadata
                        category={rel.category}
                        date={rel.date}
                        readTime={rel.readTime}
                        size="sm"
                        className="mb-3"
                      />
                      <h3 className="text-base font-bold text-foreground group-hover:text-[#1E0E6B] transition-colors duration-300 leading-snug line-clamp-2">
                        {rel.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {rel.excerpt}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1E0E6B] group-hover:gap-2 transition-all duration-300">
                        Read <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </MarketingLayout>
  )
}
