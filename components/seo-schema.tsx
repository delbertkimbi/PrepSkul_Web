import Script from 'next/script'

interface OrganizationSchemaProps {
  name?: string
  description?: string
  url?: string
  logo?: string
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  contactPoint?: {
    telephone?: string
    contactType?: string
    email?: string
  }
  sameAs?: string[]
  services?: string[]
  areaServed?: string[]
}

export function OrganizationSchema({
  name = "PrepSkul",
  description = "Expert online and home tutoring services across Cameroon. Connect with qualified tutors for academic subjects and practical skills.",
  url = "https://prepskul.com",
  logo = "https://prepskul.com/images/hero-tutoring.png",
  address = {
    streetAddress: "Main Street",
    addressLocality: "Douala",
    addressRegion: "Littoral",
    postalCode: "00000",
    addressCountry: "CM"
  },
  contactPoint = {
    telephone: "+237-XXX-XXX-XXX",
    contactType: "customer service",
    email: "info@prepskul.com"
  },
  sameAs = [
    "https://facebook.com/prepskul",
    "https://instagram.com/prepskul",
    "https://linkedin.com/company/prepskul"
  ],
  services = [
    "Online Tutoring",
    "Home Tutoring", 
    "Group Classes",
    "Exam Preparation",
    "Skill Development"
  ],
  areaServed = [
    "Douala",
    "Yaoundé", 
    "Buea",
    "Bamenda",
    "Garoua",
    "Maroua",
    "Limbe"
  ]
}: OrganizationSchemaProps) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "description": description,
    "url": url,
    "logo": {
      "@type": "ImageObject",
      "url": logo,
      "width": 300,
      "height": 300
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress,
      "addressLocality": address.addressLocality,
      "addressRegion": address.addressRegion,
      "postalCode": address.postalCode,
      "addressCountry": address.addressCountry
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": contactPoint.telephone,
      "contactType": contactPoint.contactType,
      "email": contactPoint.email
    },
    "sameAs": sameAs,
    "service": services.map(service => ({
      "@type": "Service",
      "name": service,
      "provider": {
        "@type": "Organization",
        "name": name
      },
      "areaServed": areaServed.map(area => ({
        "@type": "City",
        "name": area
      }))
    })),
    "areaServed": areaServed.map(area => ({
      "@type": "City",
      "name": area
    })),
    "foundingDate": "2024",
    "numberOfEmployees": "10-50",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationSchema, null, 2)
      }}
    />
  )
}

interface LocalBusinessSchemaProps {
  name?: string
  description?: string
  url?: string
  image?: string
  telephone?: string
  email?: string
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  geo?: {
    latitude?: number
    longitude?: number
  }
  openingHours?: string[]
  priceRange?: string
  services?: string[]
}

export function LocalBusinessSchema({
  name = "PrepSkul Tutoring Services",
  description = "Professional tutoring services in Cameroon. Online and home tutoring for all subjects.",
  url = "https://prepskul.com",
  image = "https://prepskul.com/images/hero-tutoring.png",
  telephone = "+237-XXX-XXX-XXX",
  email = "info@prepskul.com",
  address = {
    streetAddress: "Main Street",
    addressLocality: "Douala",
    addressRegion: "Littoral",
    postalCode: "00000",
    addressCountry: "CM"
  },
  geo = {
    latitude: 4.0483,
    longitude: 9.7043
  },
  openingHours = [
    "Mo-Fr 08:00-18:00",
    "Sa 09:00-15:00"
  ],
  priceRange = "$$",
  services = [
    "Online Tutoring",
    "Home Tutoring",
    "Group Classes",
    "Exam Preparation"
  ]
}: LocalBusinessSchemaProps) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": name,
    "description": description,
    "url": url,
    "image": image,
    "telephone": telephone,
    "email": email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress,
      "addressLocality": address.addressLocality,
      "addressRegion": address.addressRegion,
      "postalCode": address.postalCode,
      "addressCountry": address.addressCountry
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": geo.latitude,
      "longitude": geo.longitude
    },
    "openingHours": openingHours,
    "priceRange": priceRange,
    "service": services.map(service => ({
      "@type": "Service",
      "name": service
    })),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    }
  }

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(localBusinessSchema, null, 2)
      }}
    />
  )
}

interface FAQSchemaProps {
  faqs: Array<{
    question: string
    answer: string
  }>
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema, null, 2)
      }}
    />
  )
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema, null, 2)
      }}
    />
  )
}

