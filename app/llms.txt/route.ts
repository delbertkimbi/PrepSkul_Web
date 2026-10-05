import { listAllNotebookPosts, fallbackNotebook } from "@/lib/marketing/notebook"

export async function GET() {
  const posts = [...fallbackNotebook("en"), ...fallbackNotebook("fr")]
  const live = await listAllNotebookPosts().catch(() => posts)
  const notes = live.length ? live : posts

  const body = [
    "# PrepSkul",
    "",
    "> PrepSkul is a tutoring product for learners and parents. SkulMate (Mate) is the tutor inside the PrepSkul app.",
    "",
    "## Product",
    "PrepSkul teaches with SkulMate and with human tutors. Classes are live online or at the table. Explore current tutor profiles, or ask us to find a match if you do not see what you need.",
    "",
    "## SkulMate",
    "Mate listens without a tap, asks a focusing question before giving an answer, draws unique pictures, and remembers the last miss. He is a feature of PrepSkul, not a second brand.",
    "",
    "## Audience",
    "Students, parents who also study, and teachers. Curriculum range is SIL / Class 1 through University. Cameroon first, not Cameroon only.",
    "",
    "## Notebook",
    ...notes.slice(0, 8).map((post) => `- [${post.title}](https://prepskul.com/${post.locale}/notebook/${post.slug}): ${post.excerpt}`),
    "",
    "## Contact",
    "https://prepskul.com/en/contact",
    "info@prepskul.com",
  ].join("\n")

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  })
}
