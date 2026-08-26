import { Request, Response } from 'express';
import { ProductModel } from '../models/product.model.js';

export class SEOController {
  public static async getRobotsTxt(_req: Request, res: Response): Promise<void> {
    const content = `User-agent: *
Allow: /
Allow: /collections
Allow: /product/
Allow: /products/
Allow: /customize

Disallow: /admin/
Disallow: /checkout/
Disallow: /account/
Disallow: /api/

Sitemap: ${process.env.CLIENT_ORIGIN || 'https://stitchxplus.com'}/sitemap.xml`;

    res.header('Content-Type', 'text/plain');
    res.status(200).send(content);
  }

  public static async getSitemapXml(_req: Request, res: Response): Promise<void> {
    try {
      const baseUrl = process.env.CLIENT_ORIGIN || 'https://stitchxplus.com';
      const products = await ProductModel.find({ inStock: true }).select('slug updatedAt').lean();

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      const staticPages = [
        { path: '', priority: '1.0', changefreq: 'daily' },
        { path: '/collections', priority: '0.9', changefreq: 'daily' },
        { path: '/customize', priority: '0.9', changefreq: 'weekly' },
        { path: '/login', priority: '0.3', changefreq: 'monthly' },
        { path: '/register', priority: '0.3', changefreq: 'monthly' },
      ];

      staticPages.forEach((p) => {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${p.path}</loc>\n`;
        xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
        xml += `    <priority>${p.priority}</priority>\n`;
        xml += `  </url>\n`;
      });

      products.forEach((prod) => {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/product/${prod.slug}</loc>\n`;
        xml += `    <lastmod>${new Date(prod.updatedAt || Date.now()).toISOString().split('T')[0]}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });

      xml += `</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.status(200).send(xml);
    } catch (err) {
      res.status(500).send('Error generating sitemap');
    }
  }
}
