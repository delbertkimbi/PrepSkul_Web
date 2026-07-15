import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SBC Roadmap | Five Days from Idea to Demo Day",
  description: "Explore the five-day Summer Build Camp roadmap: discover a problem, plan a solution, build with AI, improve the prototype and pitch on Demo Day.",
  alternates: { canonical: "/program" },
}

export default function Layout({ children }: { children: React.ReactNode }) { return children }
