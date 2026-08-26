import { useEffect } from 'react';
import { Product } from '@stitchx/shared';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  product?: Product;
  breadcrumbs?: BreadcrumbItem[];
}

export function SEOHead({
  title,
  description,
  canonicalUrl,
  ogImage = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
  product,
  breadcrumbs,
}: SEOHeadProps) {
  useEffect(() => {
    // Update Page Title
    const fullTitle = `${title} | Stitchx Plus LLC — Bespoke Menswear`;
    document.title = fullTitle;

    // Helper function to set meta attribute
    const setMetaTag = (nameOrProperty: string, value: string, isProperty = false) => {
      const attributeName = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attributeName}="${nameOrProperty}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, nameOrProperty);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };

    // Clean raw HTML tags for plain-text meta attributes
    const cleanDesc = (product?.shortDescription || description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    // Meta Description & Theme
    setMetaTag('description', cleanDesc);
    setMetaTag('theme-color', '#0a192f');

    // Open Graph Tags
    const currentUrl = canonicalUrl || window.location.href;
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', cleanDesc, true);
    setMetaTag('og:url', currentUrl, true);
    setMetaTag('og:site_name', 'Stitchx Plus LLC', true);
    setMetaTag('og:type', product ? 'og:product' : 'website', true);
    setMetaTag('og:image', ogImage, true);

    // Twitter Card Tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', cleanDesc);
    setMetaTag('twitter:image', ogImage);

    // Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 1. Product JSON-LD Structured Data
    let productSchemaScript = document.getElementById('jsonld-product-schema') as HTMLScriptElement | null;
    if (product) {
      if (!productSchemaScript) {
        productSchemaScript = document.createElement('script');
        productSchemaScript.id = 'jsonld-product-schema';
        productSchemaScript.type = 'application/ld+json';
        document.head.appendChild(productSchemaScript);
      }

      const categoryName =
        typeof product.category === 'object' && product.category
          ? product.category.name
          : 'Bespoke Menswear';

      const jsonLdData = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images : [ogImage],
        description: product.description || description,
        sku: product.sku,
        brand: {
          '@type': 'Brand',
          name: 'Stitchx Plus LLC',
        },
        category: categoryName,
        offers: {
          '@type': 'Offer',
          url: currentUrl,
          priceCurrency: 'USD',
          price: product.basePrice,
          priceValidUntil: '2027-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'Stitchx Plus LLC',
          },
        },
        ...(product.rating
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.numReviews || 1,
              },
            }
          : {}),
      };

      productSchemaScript.textContent = JSON.stringify(jsonLdData);
    } else if (productSchemaScript) {
      productSchemaScript.remove();
    }

    // 2. Breadcrumb JSON-LD Structured Data
    let breadcrumbSchemaScript = document.getElementById('jsonld-breadcrumb-schema') as HTMLScriptElement | null;
    if (breadcrumbs && breadcrumbs.length > 0) {
      if (!breadcrumbSchemaScript) {
        breadcrumbSchemaScript = document.createElement('script');
        breadcrumbSchemaScript.id = 'jsonld-breadcrumb-schema';
        breadcrumbSchemaScript.type = 'application/ld+json';
        document.head.appendChild(breadcrumbSchemaScript);
      }

      const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      };

      breadcrumbSchemaScript.textContent = JSON.stringify(breadcrumbData);
    } else if (breadcrumbSchemaScript) {
      breadcrumbSchemaScript.remove();
    }
  }, [title, description, canonicalUrl, ogImage, product, breadcrumbs]);

  return null;
}
