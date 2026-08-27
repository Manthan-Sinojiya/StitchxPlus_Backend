import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CategoryModel } from '../models/category.model.js';
import { ProductModel } from '../models/product.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stitchxplus';

async function seedDepartmentsAndProducts() {
  try {
    console.log('Connecting to MongoDB for Seeding Complete Category & Product Catalog...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    // 1. Define Department Structure & Categories with Images and Descriptions
    const departmentDefinitions = [
      {
        name: 'Men',
        slug: 'men',
        description: 'Bespoke menswear suiting, blazers, dress shirts, formal tuxedos, and tailored trousers.',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 1,
        categories: [
          {
            name: 'Custom Suits',
            slug: 'custom-suits',
            description: 'Hand-cut bespoke two-piece and three-piece suits crafted from Vitale Barberis and Loro Piana wool.',
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Custom Blazers & Sport Coats',
            slug: 'custom-blazers',
            description: 'Unstructured hopsack blazers, cashmere sport coats, and tweed jackets.',
            image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Tuxedos & Formalwear',
            slug: 'tuxedos',
            description: 'Black-tie tuxedos featuring satin peak lapels, silk trim, and hand-finished buttonholes.',
            image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Custom Dress Shirts',
            slug: 'custom-shirts',
            description: 'Tailored dress shirts made from two-ply Thomas Mason Egyptian cotton.',
            image: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Outerwear & Overcoats',
            slug: 'outerwear',
            description: 'Cashmere topcoats, heavy wool trench coats, and car coats.',
            image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Custom Trousers & Dress Pants',
            slug: 'custom-trousers',
            description: 'Precision pleated and flat-front trousers woven from Super 130s merino wool.',
            image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1200&q=80',
          },
        ],
      },
      {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Luxury ready-to-wear coats, tailored jackets, dress shirts, silk tops, and fine Mongolian cashmere knitwear.',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 2,
        categories: [
          {
            name: 'Outerwear & Coats',
            slug: 'outerwear-coats',
            description: 'Hand-tailored overcoats, trench coats, Chesterfield coats, and wool capes crafted for timeless winter sophistication.',
            image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Evening & Formal Wear',
            slug: 'evening-formal-wear',
            description: 'Exquisite tuxedo shirts, velvet smoking jackets, silk cummerbunds, and formal waistcoats for black-tie galas.',
            image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Shirts & Tops',
            slug: 'shirts-tops',
            description: 'Precision-cut dress shirts, Sea Island cotton button-downs, and silk evening tops tailored with mother-of-pearl buttons.',
            image: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Luxury Knitwear',
            slug: 'luxury-knitwear',
            description: 'Ultra-soft Mongolian cashmere sweaters, merino wool cardigans, and silk-cotton rollnecks knit with unrivaled texture.',
            image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=1200&q=80',
          },
        ],
      },
      {
        name: 'Jewelry',
        slug: 'jewelry',
        description: 'Precision tourbillon watches, 18k gold cufflinks, signet rings, and precious metal chain necklaces.',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 3,
        categories: [
          {
            name: 'Timepieces & Watches',
            slug: 'timepieces-watches',
            description: 'Swiss-engineered chronographs, skeleton tourbillon watches, and classic automatic timepieces with sapphire crystal.',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Rings & Bands',
            slug: 'rings-bands',
            description: 'Signet rings carved with onyx and lapis lazuli, solid 18k gold bands, and platinum comfort-fit wedding rings.',
            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Necklaces & Pendants',
            slug: 'necklaces-pendants',
            description: 'Fine gold chains, custom engraved lockets, diamond solitaire pendants, and hand-carved medallion necklaces.',
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Cufflinks & Bracelets',
            slug: 'cufflinks-bracelets',
            description: 'Onyx and mother-of-pearl formal cufflinks paired with woven Italian leather gold clasp bracelets.',
            image: 'https://images.unsplash.com/photo-1611591475777-233cd7a772b1?auto=format&fit=crop&w=1200&q=80',
          },
        ],
      },
      {
        name: 'Shoes',
        slug: 'shoes',
        description: 'Handcrafted Goodyear welted oxfords, burnished penny loafers, Chelsea dress boots, and luxury leather sneakers.',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 4,
        categories: [
          {
            name: 'Oxford & Derby Shoes',
            slug: 'oxford-derby-shoes',
            description: 'Wholecut calfskin oxfords and hand-dressed derby shoes built with leather outsoles and hand-stitched welt lines.',
            image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Leather Loafers',
            slug: 'leather-loafers',
            description: 'Hand-burnished penny loafers, tassel slip-ons, and suede Belgian loafers with stacked leather heels.',
            image: 'https://images.unsplash.com/photo-1582837336093-6a9786a7d188?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Luxury Sneakers',
            slug: 'luxury-sneakers',
            description: 'Minimalist full-grain Italian Nappa leather low-top sneakers with cushioned Margom rubber soles.',
            image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Dress Boots',
            slug: 'dress-boots',
            description: 'Sleek Chelsea dress boots and lace-up ankle boots crafted in vegetable-tanned grain calf leather.',
            image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1200&q=80',
          },
        ],
      },
      {
        name: 'Bags',
        slug: 'bags',
        description: 'Full-grain Florentine leather briefcases, travel weekender duffle bags, structured handbags, and commuter backpacks.',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 5,
        categories: [
          {
            name: 'Executive Briefcases',
            slug: 'executive-briefcases',
            description: 'Handcrafted leather laptop briefcases and slim attaché document portfolios with solid brass hardware.',
            image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Travel Duffle Bags',
            slug: 'travel-duffle-bags',
            description: 'Generously sized 3-to-5 day weekender duffle bags featuring shoe compartments and heavy-duty brass zippers.',
            image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Designer Handbags',
            slug: 'designer-handbags',
            description: 'Italian leather structured shoulder bags, luxury totes, and gold-clasp evening clutches.',
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
          },
          {
            name: 'Leather Backpacks',
            slug: 'leather-backpacks',
            description: 'Minimalist city commuter backpacks and vintage rolltop rucksacks engineered with padded tech sleeves.',
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
          },
        ],
      },
    ];

    const categoryMap: Record<string, mongoose.Types.ObjectId> = {};

    console.log('--- Creating / Updating Departments and Categories with Images & Descriptions ---');
    for (const deptDef of departmentDefinitions) {
      let dept = await CategoryModel.findOne({ slug: deptDef.slug });
      if (!dept) {
        dept = await CategoryModel.create({
          name: deptDef.name,
          slug: deptDef.slug,
          description: deptDef.description,
          image: deptDef.image,
          isTopLevel: true,
          type: 'department',
          parentCategory: null,
          sortOrder: deptDef.sortOrder,
          isActive: true,
        });
        console.log(`Created Department: "${dept.name}" (${dept._id})`);
      } else {
        dept.isTopLevel = true;
        dept.type = 'department';
        dept.image = deptDef.image;
        dept.description = deptDef.description;
        await dept.save();
        console.log(`Updated Department: "${dept.name}" (${dept._id})`);
      }

      categoryMap[deptDef.slug] = dept._id as mongoose.Types.ObjectId;

      for (const catDef of deptDef.categories) {
        let cat = await CategoryModel.findOne({ slug: catDef.slug });
        if (!cat) {
          cat = await CategoryModel.create({
            name: catDef.name,
            slug: catDef.slug,
            description: catDef.description,
            image: catDef.image,
            isTopLevel: false,
            type: 'category',
            parentCategory: dept._id,
            isActive: true,
          });
          console.log(`  -> Created Sub-Category: "${cat.name}" under ${dept.name}`);
        } else {
          cat.parentCategory = dept._id as any;
          cat.image = catDef.image;
          cat.description = catDef.description;
          await cat.save();
          console.log(`  -> Updated Sub-Category: "${cat.name}" under ${dept.name}`);
        }
        categoryMap[catDef.slug] = cat._id as mongoose.Types.ObjectId;
      }
    }

    // 2. Define Products for ALL categories
    const productsToSeed = [
      // --- MEN'S BESPOKE SUITS & FORMALWEAR ---
      {
        name: 'Royal Navy Super 150s Wool Suit',
        slug: 'royal-navy-super-150s-wool-suit',
        sku: 'SUIT-NAV-001',
        categorySlug: 'custom-suits',
        basePrice: 1290,
        compareAtPrice: 1500,
        description: '<p>Tailored from 100% Super 150s Australian Merino wool woven in Biella, Italy. Features a half-canvas construction, notch lapel, and pick-stitching detail.</p>',
        images: [
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Royal Navy', hex: '#1b263b' },
          { name: 'Charcoal Grey', hex: '#2b2d31' },
        ],
        sizes: ['38R', '40R', '42R', '44R'],
        tags: ['suit', 'bespoke', 'wool', 'menswear'],
        isCustomizable: true,
        isFeatured: true,
        rating: 5.0,
        numReviews: 42,
      },
      {
        name: 'Italian Hopsack Navy Blazer',
        slug: 'italian-hopsack-navy-blazer',
        sku: 'BLZR-NAV-001',
        categorySlug: 'custom-blazers',
        basePrice: 790,
        compareAtPrice: 920,
        description: '<p>Lightweight Italian hopsack weave offering exceptional breathability and wrinkle resistance. Finished with genuine mother-of-pearl buttons.</p>',
        images: [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Deep Navy', hex: '#0f172a' },
          { name: 'Airforce Blue', hex: '#2563eb' },
        ],
        sizes: ['38R', '40R', '42R', '44R'],
        tags: ['blazer', 'hopsack', 'smart-casual'],
        isCustomizable: true,
        isFeatured: false,
        rating: 4.8,
        numReviews: 21,
      },
      {
        name: 'Grand Peak Lapel Black Tuxedo',
        slug: 'grand-peak-lapel-black-tuxedo',
        sku: 'TUX-BLK-001',
        categorySlug: 'tuxedos',
        basePrice: 1550,
        compareAtPrice: 1800,
        description: '<p>The pinnacle of formal evening wear. Crafted with satin peak lapels, silk jet pockets, and satin stripe trouser legs.</p>',
        images: [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Midnight Onyx', hex: '#0a0a0a' },
        ],
        sizes: ['38R', '40R', '42R', '44R'],
        tags: ['tuxedo', 'black-tie', 'formalwear'],
        isCustomizable: true,
        isFeatured: true,
        rating: 5.0,
        numReviews: 36,
      },
      {
        name: 'Sea Island Cotton Twill Shirt',
        slug: 'sea-island-cotton-twill-shirt',
        sku: 'SHRT-TWL-001',
        categorySlug: 'custom-shirts',
        basePrice: 280,
        compareAtPrice: 340,
        description: '<p>Woven from rare 100% Sea Island cotton twill. Silky smooth hand feel with spread collar and removable collar stays.</p>',
        images: [
          'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Pure White', hex: '#ffffff' },
          { name: 'Sky Blue', hex: '#bfdbfe' },
        ],
        sizes: ['15.5/34', '16/34', '16.5/35', '17/35'],
        tags: ['shirt', 'cotton', 'twill', 'dress-shirt'],
        isCustomizable: true,
        isFeatured: false,
        rating: 4.9,
        numReviews: 29,
      },
      {
        name: 'Super 130s Flat-Front Trousers',
        slug: 'super-130s-flat-front-trousers',
        sku: 'TRSR-FLT-001',
        categorySlug: 'custom-trousers',
        basePrice: 350,
        compareAtPrice: 420,
        description: '<p>Tailored flat-front dress trousers featuring side adjusters, curtain waistband, and unhemmed cuffs for custom length tailoring.</p>',
        images: [
          'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Charcoal', hex: '#374151' },
          { name: 'Navy', hex: '#1e3a8a' },
          { name: 'Khaki', hex: '#d4b996' },
        ],
        sizes: ['30', '32', '34', '36', '38'],
        tags: ['trousers', 'pants', 'wool', 'tailored'],
        isCustomizable: true,
        isFeatured: false,
        rating: 4.7,
        numReviews: 18,
      },
      {
        name: 'Classic Double-Breasted Overcoat',
        slug: 'classic-double-breasted-overcoat',
        sku: 'OUTR-DB-001',
        categorySlug: 'outerwear',
        basePrice: 1150,
        compareAtPrice: 1350,
        description: '<p>Heavyweight 100% melton wool trench coat designed to withstand severe cold while maintaining a sleek, tailored silhouette.</p>',
        images: [
          'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Camel', hex: '#c19a6b' },
          { name: 'Black', hex: '#111111' },
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        tags: ['overcoat', 'outerwear', 'wool'],
        isCustomizable: false,
        isFeatured: true,
        rating: 4.9,
        numReviews: 25,
      },

      // --- CLOTHING PRODUCTS ---
      {
        name: 'Cashmere Wool Overcoat',
        slug: 'cashmere-wool-overcoat',
        sku: 'CLTH-OVT-001',
        categorySlug: 'outerwear-coats',
        basePrice: 1450,
        compareAtPrice: 1750,
        description: '<p>Constructed from ultra-soft 100% Italian cashmere wool, this classic tailored double-breasted overcoat delivers regal elegance and exceptional warmth.</p>',
        images: [
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Charcoal', hex: '#2b2d31' },
          { name: 'Camel Tan', hex: '#a8947d' },
          { name: 'Midnight Navy', hex: '#1b263b' },
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        tags: ['outerwear', 'cashmere', 'overcoat', 'winter'],
        isCustomizable: false,
        isFeatured: true,
        rating: 4.9,
        numReviews: 24,
      },
      {
        name: 'Heritage Tweed Chesterfield Trench',
        slug: 'heritage-tweed-chesterfield-trench',
        sku: 'CLTH-OVT-002',
        categorySlug: 'outerwear-coats',
        basePrice: 1250,
        compareAtPrice: 1400,
        description: '<p>Woven from authentic Harris Tweed wool, this structured trench coat features a velvet collar inlay, slanted flap pockets, and deep storm-flap lining.</p>',
        images: [
          'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Forest Herringbone', hex: '#354230' },
          { name: 'Espresso Tweed', hex: '#3d2817' },
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        tags: ['trench', 'tweed', 'chesterfield', 'outerwear'],
        isCustomizable: false,
        isFeatured: false,
        rating: 4.8,
        numReviews: 14,
      },
      {
        name: 'Midnight Velvet Smoking Jacket',
        slug: 'midnight-velvet-smoking-jacket',
        sku: 'CLTH-EVN-001',
        categorySlug: 'evening-formal-wear',
        basePrice: 980,
        compareAtPrice: 1150,
        description: '<p>Designed for opulent evening galas, this plush velvet smoking jacket features satin shawl lapels, frog closure detailing, and silk cuffs.</p>',
        images: [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Royal Velvet', hex: '#1e293b' },
          { name: 'Deep Emerald', hex: '#064e3b' },
          { name: 'Bordeaux Red', hex: '#881337' },
        ],
        sizes: ['38R', '40R', '42R', '44R'],
        tags: ['smoking-jacket', 'velvet', 'formal', 'evening'],
        isCustomizable: false,
        isFeatured: true,
        rating: 5.0,
        numReviews: 32,
      },
      {
        name: 'Silk Blend Evening Tuxedo Shirt',
        slug: 'silk-blend-evening-tuxedo-shirt',
        sku: 'CLTH-SHRT-002',
        categorySlug: 'shirts-tops',
        basePrice: 380,
        compareAtPrice: 450,
        description: '<p>Crafted from fine Egyptian cotton with silk bib pleating, this evening shirt is designed for black-tie elegance.</p>',
        images: [
          'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Crisp White', hex: '#ffffff' },
          { name: 'Onyx Black', hex: '#121212' },
        ],
        sizes: ['15.5/34', '16/34', '16.5/35', '17/35'],
        tags: ['shirts', 'tuxedo', 'black-tie', 'silk'],
        isCustomizable: false,
        isFeatured: false,
        rating: 4.8,
        numReviews: 19,
      },
      {
        name: 'Mongolian Cashmere Rollneck Sweater',
        slug: 'mongolian-cashmere-rollneck-sweater',
        sku: 'CLTH-KNT-001',
        categorySlug: 'luxury-knitwear',
        basePrice: 520,
        compareAtPrice: 620,
        description: '<p>Knit from two-ply Grade A Mongolian cashmere, offering featherlight warmth and effortless layering.</p>',
        images: [
          'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Oatmeal Beige', hex: '#d1c7b7' },
          { name: 'Charcoal Grey', hex: '#374151' },
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        tags: ['knitwear', 'cashmere', 'rollneck', 'sweater'],
        isCustomizable: false,
        isFeatured: true,
        rating: 4.9,
        numReviews: 28,
      },

      // --- JEWELRY PRODUCTS ---
      {
        name: 'Monaco Tourbillon Skeleton Watch',
        slug: 'monaco-tourbillon-skeleton-watch',
        sku: 'JWLR-WTC-001',
        categorySlug: 'timepieces-watches',
        basePrice: 4850,
        compareAtPrice: 5400,
        description: '<p>An extraordinary piece of horological engineering. Features an exposed flying tourbillon movement encased in sapphire crystal.</p>',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Rose Gold', hex: '#b76e79' },
          { name: 'Silver Steel', hex: '#c0c0c0' },
        ],
        sizes: ['40mm', '42mm'],
        tags: ['jewelry', 'watch', 'tourbillon', 'luxury'],
        isCustomizable: false,
        isFeatured: true,
        rating: 5.0,
        numReviews: 31,
      },
      {
        name: '18k Gold Onyx Signet Ring',
        slug: '18k-gold-onyx-signet-ring',
        sku: 'JWLR-RNG-001',
        categorySlug: 'rings-bands',
        basePrice: 780,
        compareAtPrice: 900,
        description: '<p>Solid 18k yellow gold signet ring inlaid with a polished black onyx gemstone.</p>',
        images: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: '18k Yellow Gold', hex: '#d4af37' },
          { name: 'Platinum', hex: '#e5e4e2' },
        ],
        sizes: ['7', '8', '9', '10', '11'],
        tags: ['jewelry', 'ring', 'signet', 'gold', 'onyx'],
        isCustomizable: false,
        isFeatured: true,
        rating: 4.9,
        numReviews: 22,
      },
      {
        name: 'Hand-Carved Gold Locket Necklace',
        slug: 'hand-carved-gold-locket-necklace',
        sku: 'JWLR-NCK-001',
        categorySlug: 'necklaces-pendants',
        basePrice: 650,
        compareAtPrice: 750,
        description: '<p>An intricate vintage-inspired oval locket pendant forged in 14k gold.</p>',
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1611591475777-233cd7a772b1?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: '14k Yellow Gold', hex: '#d4af37' },
          { name: 'Rose Gold', hex: '#b76e79' },
        ],
        sizes: ['20 inch', '24 inch'],
        tags: ['jewelry', 'necklace', 'locket', 'gold'],
        isCustomizable: false,
        isFeatured: false,
        rating: 4.8,
        numReviews: 16,
      },
      {
        name: 'Handcrafted Onyx & Gold Cufflinks',
        slug: 'handcrafted-onyx-gold-cufflinks',
        sku: 'JWLR-CFF-002',
        categorySlug: 'cufflinks-bracelets',
        basePrice: 420,
        compareAtPrice: 500,
        description: '<p>Made with natural hand-cut black onyx gemstones framed in solid 18k gold plating.</p>',
        images: [
          'https://images.unsplash.com/photo-1611591475777-233cd7a772b1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: '18k Yellow Gold', hex: '#d4af37' },
          { name: 'Platinum White', hex: '#e5e4e2' },
        ],
        sizes: ['One Size'],
        tags: ['jewelry', 'cufflinks', 'onyx', 'accessories'],
        isCustomizable: false,
        isFeatured: false,
        rating: 4.9,
        numReviews: 12,
      },

      // --- SHOES PRODUCTS ---
      {
        name: 'Italian Calfskin Wholecut Oxford Shoes',
        slug: 'italian-calfskin-wholecut-oxford-shoes',
        sku: 'SHOE-OXF-001',
        categorySlug: 'oxford-derby-shoes',
        basePrice: 890,
        compareAtPrice: 1050,
        description: '<p>Masterfully crafted from a single flawless piece of full-grain Italian calfskin leather.</p>',
        images: [
          'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Espresso Brown', hex: '#4a2e1b' },
          { name: 'Midnight Black', hex: '#121212' },
        ],
        sizes: ['40 (7.5 US)', '41 (8.5 US)', '42 (9.5 US)', '43 (10.5 US)', '44 (11.5 US)'],
        tags: ['shoes', 'oxford', 'leather', 'italian'],
        isCustomizable: false,
        isFeatured: true,
        rating: 4.9,
        numReviews: 45,
      },
      {
        name: 'Hand-Burnished Penny Loafers',
        slug: 'hand-burnished-penny-loafers',
        sku: 'SHOE-LOF-002',
        categorySlug: 'leather-loafers',
        basePrice: 750,
        compareAtPrice: 880,
        description: '<p>Hand-burnished leather slip-on loafers featuring classic strap apron stitch styling.</p>',
        images: [
          'https://images.unsplash.com/photo-1582837336093-6a9786a7d188?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Deep Burgundy', hex: '#58111a' },
          { name: 'Vintage Cognac', hex: '#9a5026' },
        ],
        sizes: ['40 (7.5 US)', '41 (8.5 US)', '42 (9.5 US)', '43 (10.5 US)', '44 (11.5 US)'],
        tags: ['shoes', 'loafers', 'penny-loafers', 'burnished'],
        isCustomizable: false,
        isFeatured: false,
        rating: 4.7,
        numReviews: 18,
      },
      {
        name: 'Low-Top Nappa Leather Sneakers',
        slug: 'low-top-nappa-leather-sneakers',
        sku: 'SHOE-SNK-001',
        categorySlug: 'luxury-sneakers',
        basePrice: 420,
        compareAtPrice: 490,
        description: '<p>Sleek, minimalist sneakers handmade in Marche, Italy using butter-soft Nappa calfskin.</p>',
        images: [
          'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'All White', hex: '#ffffff' },
          { name: 'Matte Black', hex: '#1a1a1a' },
        ],
        sizes: ['40 (7.5 US)', '41 (8.5 US)', '42 (9.5 US)', '43 (10.5 US)', '44 (11.5 US)'],
        tags: ['shoes', 'sneakers', 'luxury', 'nappa'],
        isCustomizable: false,
        isFeatured: true,
        rating: 4.9,
        numReviews: 52,
      },
      {
        name: 'Hand-Patinated Chelsea Dress Boots',
        slug: 'hand-patinated-chelsea-dress-boots',
        sku: 'SHOE-BOT-001',
        categorySlug: 'dress-boots',
        basePrice: 920,
        compareAtPrice: 1100,
        description: '<p>Iconic Chelsea boots built with elastic side gussets and hand-burnished toe caps.</p>',
        images: [
          'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Dark Chestnut', hex: '#3e2723' },
          { name: 'Onyx Black', hex: '#121212' },
        ],
        sizes: ['40 (7.5 US)', '41 (8.5 US)', '42 (9.5 US)', '43 (10.5 US)', '44 (11.5 US)'],
        tags: ['shoes', 'boots', 'chelsea', 'patinated'],
        isCustomizable: false,
        isFeatured: false,
        rating: 4.8,
        numReviews: 21,
      },

      // --- BAGS PRODUCTS ---
      {
        name: 'Florentine Full-Grain Leather Briefcase',
        slug: 'florentine-full-grain-leather-briefcase',
        sku: 'BAG-BRF-001',
        categorySlug: 'executive-briefcases',
        basePrice: 1280,
        compareAtPrice: 1450,
        description: '<p>Handmade in Florence using vegetable-tanned full-grain Tuscan leather.</p>',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Saddle Tan', hex: '#a0522d' },
          { name: 'Dark Chocolate', hex: '#3d2314' },
        ],
        sizes: ['One Size'],
        tags: ['bags', 'briefcase', 'leather', 'executive'],
        isCustomizable: false,
        isFeatured: true,
        rating: 5.0,
        numReviews: 38,
      },
      {
        name: 'Weekender Grand Leather Duffle Bag',
        slug: 'weekender-grand-leather-duffle-bag',
        sku: 'BAG-DUF-002',
        categorySlug: 'travel-duffle-bags',
        basePrice: 1650,
        compareAtPrice: 1890,
        description: '<p>Generously sized for 3-5 day getaways with a separate shoe compartment.</p>',
        images: [
          'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Heritage Tan', hex: '#c19a6b' },
          { name: 'Midnight Blue', hex: '#191970' },
        ],
        sizes: ['Medium (45L)', 'Large (60L)'],
        tags: ['bags', 'duffle', 'travel', 'weekender'],
        isCustomizable: false,
        isFeatured: true,
        rating: 4.9,
        numReviews: 29,
      },
      {
        name: 'Italian Structured Leather Tote Bag',
        slug: 'italian-structured-leather-tote-bag',
        sku: 'BAG-TOT-001',
        categorySlug: 'designer-handbags',
        basePrice: 950,
        compareAtPrice: 1100,
        description: '<p>Crafted in Milan from scratch-resistant saffiano leather with gold hardware.</p>',
        images: [
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Cognac Gold', hex: '#b87333' },
          { name: 'Nero Black', hex: '#111111' },
        ],
        sizes: ['One Size'],
        tags: ['bags', 'tote', 'handbag', 'designer'],
        isCustomizable: false,
        isFeatured: true,
        rating: 4.9,
        numReviews: 33,
      },
      {
        name: 'Minimalist Commuter Leather Backpack',
        slug: 'minimalist-commuter-leather-backpack',
        sku: 'BAG-BPK-001',
        categorySlug: 'leather-backpacks',
        basePrice: 780,
        compareAtPrice: 890,
        description: '<p>Features water-resistant leather construction, hidden security pockets, and laptop sleeve.</p>',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
        ],
        colors: [
          { name: 'Matte Obsidian', hex: '#1c1c1c' },
          { name: 'Tobacco Brown', hex: '#795548' },
        ],
        sizes: ['One Size'],
        tags: ['bags', 'backpack', 'commuter', 'leather'],
        isCustomizable: false,
        isFeatured: false,
        rating: 4.8,
        numReviews: 27,
      },
    ];

    console.log('\n--- Seeding / Updating Products for ALL Categories ---');

    for (const prodData of productsToSeed) {
      const catId = categoryMap[prodData.categorySlug];
      if (!catId) {
        console.warn(`Category slug "${prodData.categorySlug}" not found! Skipping product ${prodData.name}`);
        continue;
      }

      // Generate simpleVariants matrix automatically
      const simpleVariants: Array<{ name: string; colorName: string; sizeName: string; sku: string; stockQuantity: number; inStock: boolean }> = [];

      prodData.colors.forEach((col) => {
        prodData.sizes.forEach((sz) => {
          const colorTag = col.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
          const sizeTag = sz.toUpperCase().replace(/[^A-Z0-9]/g, '');

          simpleVariants.push({
            name: `${col.name} / ${sz}`,
            colorName: col.name,
            sizeName: sz,
            sku: `${prodData.sku}-${colorTag}-${sizeTag}`,
            stockQuantity: 25,
            inStock: true,
          });
        });
      });

      const existingProd = await ProductModel.findOne({ slug: prodData.slug });
      if (existingProd) {
        existingProd.name = prodData.name;
        existingProd.sku = prodData.sku;
        existingProd.category = catId;
        existingProd.basePrice = prodData.basePrice;
        existingProd.compareAtPrice = prodData.compareAtPrice;
        existingProd.description = prodData.description;
        existingProd.images = prodData.images;
        existingProd.colors = prodData.colors;
        existingProd.sizes = prodData.sizes;
        existingProd.simpleVariants = simpleVariants;
        existingProd.tags = prodData.tags;
        existingProd.isCustomizable = prodData.isCustomizable;
        existingProd.isFeatured = prodData.isFeatured;
        existingProd.rating = prodData.rating;
        existingProd.numReviews = prodData.numReviews;
        existingProd.status = 'active';
        existingProd.inStock = true;
        await existingProd.save();
        console.log(`Updated Product: "${existingProd.name}" (${existingProd.slug})`);
      } else {
        const createdProd = await ProductModel.create({
          name: prodData.name,
          slug: prodData.slug,
          sku: prodData.sku,
          category: catId,
          basePrice: prodData.basePrice,
          compareAtPrice: prodData.compareAtPrice,
          description: prodData.description,
          images: prodData.images,
          colors: prodData.colors,
          sizes: prodData.sizes,
          simpleVariants,
          tags: prodData.tags,
          isCustomizable: prodData.isCustomizable,
          isFeatured: prodData.isFeatured,
          rating: prodData.rating,
          numReviews: prodData.numReviews,
          status: 'active',
          inStock: true,
        });
        console.log(`Created Product: "${createdProd.name}" (${createdProd.slug})`);
      }
    }

    console.log('\n✅ All Categories in MongoDB now have images, rich descriptions, and fully populated product catalogs across Men, Clothing, Jewelry, Shoes, and Bags!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDepartmentsAndProducts();
