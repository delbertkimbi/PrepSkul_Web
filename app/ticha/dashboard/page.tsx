import { TichaHeader } from "@/components/ticha/header"
import { TichaFooter } from "@/components/ticha/footer"

export default function TichaDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TichaHeader />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Sign in to access your presentations and manage your documents.
          </p>
          <p className="text-sm text-muted-foreground">
            This feature is coming soon.
          </p>
        </div>
      </main>

      <TichaFooter />
    </div>
  )
}

