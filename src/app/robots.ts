import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://podilo.cz';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/auth/', '/my-listings', '/saved', '/add', '/login', '/register'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
