import type { Metadata } from "next"
import AmbassadorsLayoutClient from "./layout-client"

export const metadata: Metadata = {
  title: "Become a PrepSkul Ambassador | Join Our Community",
  description: "Join the PrepSkul Ambassador program and help expand access to learning opportunities. Represent PrepSkul in schools, communities, and online. Apply now!",
  icons: {
    icon: '/ambassador-favicon.png',
  },
  openGraph: {
    title: "Become a PrepSkul Ambassador",
    description: "Join the PrepSkul Ambassador program and help expand access to learning opportunities. Represent PrepSkul in schools, communities, and online.",
  },
}

export default function AmbassadorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AmbassadorsLayoutClient>
      {children}
    </AmbassadorsLayoutClient>
  )
}
