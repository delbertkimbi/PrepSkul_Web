import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NotebookCards } from "@/components/marketing/notebook-cards"
import { ScrollFill } from "@/components/marketing/scroll-fill"
import { aliveCopy } from "@/lib/marketing/alive-copy"
import { listNotebookPosts } from "@/lib/marketing/notebook"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const c = aliveCopy(locale)
  return {
    title: `${c.notebook.title} | PrepSkul`,
    description: c.notebook.lead,
    alternates: { canonical: `https://prepskul.com/${locale}/notebook` },
  }
}

export default async function NotebookIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const c = aliveCopy(locale)
  const posts = await listNotebookPosts(locale, 24)

  return (
    <div className="ps-site min-h-screen">
      <ScrollFill />
      <Header />
      <main>
        <NotebookCards locale={locale} posts={posts} title={c.notebook.title} lead={c.notebook.lead} />
      </main>
      <Footer />
    </div>
  )
}
