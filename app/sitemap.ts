import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://prepskul.com'
  const locales = ['en', 'fr']
  const pages = ['', 'about', 'programs', 'tutors', 'how-it-works', 'testimonials', 'contact']
  const cities = ['douala', 'yaounde', 'buea', 'bamenda', 'garoua', 'maroua', 'limbe']
  
  const sitemap: MetadataRoute.Sitemap = []
  
  // Add root redirect
  sitemap.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  })
  
  // Add localized pages
  locales.forEach(locale => {
    pages.forEach(page => {
      const url = page ? `${baseUrl}/${locale}/${page}` : `${baseUrl}/${locale}`
      sitemap.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === '' || page === 'programs' || page === 'tutors' ? 'weekly' : 'monthly',
        priority: page === '' ? 1 : page === 'programs' || page === 'tutors' ? 0.9 : 0.8,
      })
    })
    
    // Add city-specific pages
    cities.forEach(city => {
      sitemap.push({
        url: `${baseUrl}/${locale}/tutors/${city}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: city === 'douala' || city === 'yaounde' ? 0.9 : 0.8,
      })
    })
  })
  
  return sitemap
}
