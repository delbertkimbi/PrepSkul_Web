import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { BreadcrumbSchema } from "./seo-schema"

interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Add home as the first item if not already present
  const allItems = [
    { name: "Home", href: "/" },
    ...items
  ]

  // Convert to the format expected by BreadcrumbSchema
  const schemaItems = allItems.map(item => ({
    name: item.name,
    url: item.href
  }))

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link 
          href="/" 
          className="flex items-center hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="sr-only">Home</span>
        </Link>
        
        {allItems.slice(1).map((item, index) => (
          <div key={index} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4" />
            {index === allItems.length - 1 ? (
              <span className="font-medium text-foreground">{item.name}</span>
            ) : (
              <Link 
                href={item.href} 
                className="hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}
