import Link from "next/link"
import { PaperCutout, PaperSheet } from "@/components/marketing/paper"
import type { NotebookPost } from "@/lib/marketing/notebook"

function formatDate(value: string, locale: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat(locale.startsWith("fr") ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function NotebookCards({
  locale,
  posts,
  title,
  lead,
}: {
  locale: string
  posts: NotebookPost[]
  title: string
  lead: string
}) {
  if (!posts.length) return null
  const fr = locale.startsWith("fr")

  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="ps-h2 max-w-2xl">{title}</h2>
        <p className="ps-lead mt-3 max-w-2xl">{lead}</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {posts.map((post, i) => (
            <Link key={post.id} href={`/${locale}/notebook/${post.slug}`} className="group">
              <PaperSheet className="ps-fill-well h-full p-5 sm:p-6" tone={i === 1 ? "yellow" : i === 2 ? "mint" : "blue"} rotate={i === 1 ? 1 : -1}>
                <PaperCutout src={post.tile} className="h-16 w-16 sm:h-20 sm:w-20" />
                <p className="mt-4 text-sm font-semibold text-[#5C6B84]">{formatDate(post.updatedAt, locale)}</p>
                <h3 className="mt-2 text-xl font-black uppercase leading-tight text-[#1B2C4F] group-hover:text-[#0EA5E9]">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5C6B84]">{post.excerpt}</p>
                <span className="mt-4 inline-flex text-sm font-black text-[#0EA5E9] underline decoration-[#EAB308] decoration-4 underline-offset-4">
                  {fr ? "Lire" : "Read"}
                </span>
              </PaperSheet>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
