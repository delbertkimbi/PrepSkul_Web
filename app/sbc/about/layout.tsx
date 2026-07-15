import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About SBC | Building 10,000 Young Innovators",
  description: "Discover Summer Build Camp’s long-term vision to help 10,000 African young people become confident problem-solvers, builders and mentors by 2030.",
  alternates: { canonical: "/about" },
}

export default function Layout({ children }: { children: React.ReactNode }) { return children }
