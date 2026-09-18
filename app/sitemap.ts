import { MetadataRoute } from 'next'
import { listAllNotebookPosts } from '@/lib/marketing/notebook'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://prepskul.com'
  const locales = ['en', 'fr']
  const pages = ['', 'about', 'programs', 'find', 'mate', 'onboard', 'notebook', 'contact', 'tutors']
  const notes = await listAllNotebookPosts().catch(() => [])

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  locales.forEach(locale => {
    pages.forEach(page => {
      const url = page ? `${baseUrl}/${locale}/${page}` : `${baseUrl}/${locale}`
      sitemap.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === '' || page === 'notebook' || page === 'find' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : page === 'notebook' || page === 'find' ? 0.9 : 0.8,
      })
    })
  })

  notes.forEach((post) => {
    sitemap.push({
      url: `${baseUrl}/${post.locale}/notebook/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.85,
    })
  })

  return sitemap
}
