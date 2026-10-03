import Link from "next/link"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PaperButton, PaperCutout, PaperSheet } from "@/components/marketing/paper"
import { ScrollFill } from "@/components/marketing/scroll-fill"
import { getNotebookPost } from "@/lib/marketing/notebook"
import { ArticleSchema } from "@/components/seo-schema"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getNotebookPost(locale, slug)
  if (!post) return { title: "Notebook | PrepSkul" }
  return {
    title: `${post.title} | PrepSkul`,
    description: post.excerpt,
    alternates: { canonical: `https://prepskul.com/${locale}/notebook/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
  }
}

export default async function NotebookPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const post = await getNotebookPost(locale, slug)
  if (!post) notFound()
  const fr = locale.startsWith("fr")
  const paragraphs = post.body.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean)

  return (
    <div className="ps-site min-h-screen">
      <ArticleSchema
        title={post.title}
        description={post.excerpt}
        url={`https://prepskul.com/${locale}/notebook/${post.slug}`}
        datePublished={post.publishedAt}
        dateModified={post.updatedAt}
      />
      <ScrollFill />
      <Header />
      <main className="ps-wrap py-14 lg:py-20">
        <Link href={`/${locale}/notebook`} className="text-sm font-black text-[#0EA5E9] underline decoration-[#EAB308] decoration-4 underline-offset-4">
          {fr ? "Du carnet" : "From the notebook"}
        </Link>
        <PaperSheet className="mt-8 overflow-hidden p-6 sm:p-10" tone="cream" rotate={-0.5}>
          <PaperCutout src={post.tile} className="h-20 w-20" />
          <h1 className="ps-h1 mt-6 max-w-3xl text-[#1B2C4F]">{post.title}</h1>
          <p className="ps-lead mt-4 max-w-2xl">{post.excerpt}</p>
          <div className="mt-8 max-w-2xl space-y-4 text-[15px] leading-7 text-[#5C6B84]">
            {paragraphs.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
          </div>
          <Link href={`/${locale}/onboard`} className="mt-10 inline-block">
            <PaperButton>{fr ? "Commencer" : "Get started"}</PaperButton>
          </Link>
        </PaperSheet>
      </main>
      <Footer />
    </div>
  )
}
