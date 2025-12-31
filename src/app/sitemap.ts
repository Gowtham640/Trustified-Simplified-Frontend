import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use production domain - Google rejects preview URLs
  const baseUrl = 'https://trustified-simplified-frontend.vercel.app'

  // Static pages - simplified metadata as Google doesn't use priority/changefreq
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
    },
  ]

  try {
    // Fetch all completed products to generate dynamic URLs
    const { data: products, error } = await supabase
      .from('reports')
      .select('product_id, product_category, updated_at')
      .eq('image_status', 'completed')
      .order('updated_at', { ascending: false })

    // Type assertion for the selected fields
    const typedProducts = products as Array<{
      product_id: string
      product_category: string | null
      updated_at: string
    }> | null

    if (error) {
      console.error('Error fetching products for sitemap:', error)
      return staticPages
    }

    if (!typedProducts || typedProducts.length === 0) {
      return staticPages
    }

    // Collect unique categories
    const categories = new Set<string>()
    const productPages: MetadataRoute.Sitemap = []
    const categoryPages: MetadataRoute.Sitemap = []

    typedProducts.forEach((product) => {
      // Add product page - only include lastModified as Google doesn't use other fields
      productPages.push({
        url: `${baseUrl}/product/${product.product_id}`,
        lastModified: new Date(product.updated_at),
      })

      // Collect category
      if (product.product_category) {
        categories.add(product.product_category)
      }
    })

    // Add category pages - simplified metadata
    categories.forEach((category) => {
      categoryPages.push({
        url: `${baseUrl}/category/${category.toLowerCase().replace(/\s+/g, '-')}`,
        lastModified: new Date(),
      })
    })

    // Combine all pages
    return [
      ...staticPages,
      ...categoryPages,
      ...productPages,
    ]

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
