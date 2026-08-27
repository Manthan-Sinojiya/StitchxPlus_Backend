import { Request, Response, NextFunction } from 'express';
import { BlogModel } from '../models/blog.model.js';
import { ApiResponse } from '@stitchx/shared';

// Pre-seeded luxury blog posts fallback if DB is initially empty
const DEFAULT_BLOG_POSTS = [
  {
    title: 'The Art of Italian Bespoke Tailoring: A Masterclass in Silhouette',
    slug: 'art-of-italian-bespoke-tailoring',
    excerpt: 'Discover how century-old Neapolitan pattern engineering creates weightless structure, natural shoulders, and effortless elegance.',
    content: `
      <h2>The Heritage of Italian Master Tailors</h2>
      <p>True bespoke tailoring is not merely about body measurements—it is an architectural art form designed to harmonize with your unique anatomy. Originating from renowned ateliers in Naples and Biella, the Italian silhouette is celebrated worldwide for its soft canvas structure, high armholes, and subtle hand-sewn details.</p>
      
      <h3>Key Pillars of Bespoke Construction</h3>
      <ul>
        <li><strong>Soft Canvas Interior:</strong> Pure horsehair and camel hair canvas that molds to your torso over time.</li>
        <li><strong>Spalla Camicia Shoulder:</strong> A shirt-style sleeve insert that allows uninhibited movement and casual grace.</li>
        <li><strong>Hand-Stitched Lapel Roll:</strong> Hundreds of blind hand stitches ensuring the lapel rolls naturally without mechanical creasing.</li>
      </ul>
      
      <blockquote>"A suit should feel like a second skin—never stiff, always fluid."</blockquote>
      
      <p>When selecting your next custom suit, consider the weave and weight of the fabric. Super 130s and 150s Australian Merino wool offer optimal drape for year-round elegance.</p>
    `,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
    author: 'Master Tailor Alexander V.',
    category: 'Style & Heritage',
    tags: ['Tailoring', 'Bespoke', 'Italian Wool', 'Style Guide'],
    readTime: '6 min read',
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    title: 'Understanding Fabric Weights: From Super 110s to Super 180s',
    slug: 'understanding-fabric-weights-super-wools',
    excerpt: 'Demystifying wool thread counts, micron ratings, and seasonal fabric weights for custom suit selection.',
    content: `
      <h2>Navigating Wool Specifications</h2>
      <p>When curating your custom wardrobe, understanding wool specifications ensures your garments perform effortlessly across seasons. The 'Super' number designates the fineness of the raw wool fiber, measured in microns.</p>
      
      <h3>Choosing the Right Weave for Your Lifestyle</h3>
      <p>For daily executive wear, Super 120s and 130s provide the ideal balance between luxurious hand-feel and wrinkle resistance. Super 150s and higher represent rare, ultra-fine fibers best reserved for black-tie affairs and formal celebrations.</p>
      
      <ul>
        <li><strong>Four-Season Weave (260g - 290g):</strong> Ideal for temperate climates and frequent travel.</li>
        <li><strong>Summer Tropical Wool (220g - 240g):</strong> Open weave for maximum breathability.</li>
        <li><strong>Winter Flannel & Cashmere (320g+):</strong> Rich texture and supreme insulation.</li>
      </ul>
    `,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    author: 'Elegance Editor Marcus Chen',
    category: 'Fabric Science',
    tags: ['Fabrics', 'Wool Guide', 'Material Care'],
    readTime: '4 min read',
    isPublished: true,
    publishedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    title: 'The Modern Black Tie Dress Code: Tuxedos & Eveningwear Rules',
    slug: 'modern-black-tie-tuxedo-guide',
    excerpt: 'Essential rules for black-tie events, dinner jackets, satin lapels, and evening accessories.',
    content: `
      <h2>Mastering Formal Eveningwear</h2>
      <p>Black tie remains the pinnacle of men's sartorial traditions. Whether attending a gala or your own wedding, adhering to proper eveningwear protocol guarantees flawless confidence.</p>
      
      <h3>The Fundamentals of a Peak Lapel Tuxedo</h3>
      <p>Opt for single-breasted jacket designs with silk satin or grosgrain facing. Contrast the rich black or midnight blue wool with a crisp Marcella bib cotton tuxedo shirt and hand-tied silk bow tie.</p>
    `,
    image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1200&q=80',
    author: 'Atelier Director Julian Vance',
    category: 'Formalwear',
    tags: ['Tuxedo', 'Black Tie', 'Gala', 'Eveningwear'],
    readTime: '5 min read',
    isPublished: true,
    publishedAt: new Date(Date.now() - 86400000 * 7),
  },
];

export class BlogController {
  // Public: Get all blogs
  public static async getBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, search, tag, isPublished } = req.query;
      const query: any = {};

      if (isPublished !== 'false') {
        query.isPublished = true;
      }

      if (category && typeof category === 'string') {
        query.category = { $regex: new RegExp(category, 'i') };
      }

      if (tag && typeof tag === 'string') {
        query.tags = tag;
      }

      if (search && typeof search === 'string') {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ];
      }

      let blogs = await BlogModel.find(query).sort({ publishedAt: -1, createdAt: -1 }).exec();

      // If DB is fresh/empty, auto seed default blogs
      if (blogs.length === 0 && !category && !search && !tag) {
        blogs = await BlogModel.insertMany(DEFAULT_BLOG_POSTS);
      }

      const response: ApiResponse<any> = {
        success: true,
        data: blogs,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Public: Get single blog by slug or ID
  public static async getBlogBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      let blog = await BlogModel.findOne({
        $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
      }).exec();

      if (!blog) {
        // Fallback search in default set
        const matchedDefault = DEFAULT_BLOG_POSTS.find((b) => b.slug === slug);
        if (matchedDefault) {
          blog = await BlogModel.create(matchedDefault);
        }
      }

      if (!blog) {
        res.status(404).json({
          success: false,
          error: { code: 'BLOG_NOT_FOUND', message: 'Blog article not found' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: blog,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Create Blog
  public static async createBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, slug, excerpt, content, image, author, category, tags, readTime, isPublished } = req.body;

      if (!title || !content) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'Title and content are required' },
        });
        return;
      }

      const generatedSlug = (slug || title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Check unique slug
      const existing = await BlogModel.findOne({ slug: generatedSlug }).exec();
      const finalSlug = existing ? `${generatedSlug}-${Date.now()}` : generatedSlug;

      const newBlog = await BlogModel.create({
        title,
        slug: finalSlug,
        excerpt: excerpt || '',
        content,
        image: image || '',
        author: author || 'Stitchx Plus Atelier',
        category: category || 'General',
        tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
        readTime: readTime || '5 min read',
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        publishedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        data: newBlog,
        message: 'Blog post created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Update Blog
  public static async updateBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      if (updateData.slug) {
        updateData.slug = updateData.slug
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }

      if (typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags.split(',').map((t: string) => t.trim());
      }

      const updatedBlog = await BlogModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();

      if (!updatedBlog) {
        res.status(404).json({
          success: false,
          error: { code: 'BLOG_NOT_FOUND', message: 'Blog article not found' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedBlog,
        message: 'Blog post updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Delete Blog
  public static async deleteBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await BlogModel.findByIdAndDelete(id).exec();

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: { code: 'BLOG_NOT_FOUND', message: 'Blog article not found' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Blog post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
