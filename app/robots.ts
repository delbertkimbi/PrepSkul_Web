import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/llms.txt', '/en/notebook', '/fr/notebook'],
      disallow: ['/api/', '/admin/', '/_next/'],
    },
    sitemap: 'https://prepskul.com/sitemap.xml',
    host: 'https://prepskul.com',
  }
}

