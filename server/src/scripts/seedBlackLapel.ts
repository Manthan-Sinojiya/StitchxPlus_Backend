import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { hashPassword } from '../utils/auth.js';
import {
  UserModel,
  CategoryModel,
  FabricModel,
  CustomizationOptionModel,
  ProductModel,
  CouponModel,
  MeasurementProfileModel,
  PageModel,
  SiteContentModel,
  ReviewModel,
} from '../models/index.js';

interface BlackLapelProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: Array<{
    price: string;
    compare_at_price?: string | null;
    sku?: string | null;
  }>;
  images: Array<{
    src: string;
    alt?: string | null;
  }>;
}

async function fetchAllBlackLapelProducts(): Promise<BlackLapelProduct[]> {
  console.log('🌐 Fetching live Black Lapel product catalog...');
  const allProducts: BlackLapelProduct[] = [];

  for (let page = 1; page <= 5; page++) {
    try {
      const url = `https://blacklapel.com/products.json?limit=250&page=${page}`;
      const res = await fetch(url);
      if (!res.ok) break;
      const data = (await res.json()) as { products: BlackLapelProduct[] };
      if (!data.products || data.products.length === 0) break;
      console.log(`   Page ${page}: ${data.products.length} products`);
      allProducts.push(...data.products);
      if (data.products.length < 250) break;
    } catch (err) {
      console.error(`   Error on page ${page}:`, err);
      break;
    }
  }

  console.log(`✅ Total fetched: ${allProducts.length} products\n`);
  return allProducts;
}

function cleanHtmlDescription(html: string): { shortDesc: string; fullDesc: string } {
  if (!html) return { shortDesc: 'Custom bespoke garment tailored to your exact measurements.', fullDesc: 'Custom bespoke garment tailored to your exact measurements.' };
  const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const shortDesc = cleanText.length > 160 ? cleanText.substring(0, 157) + '...' : cleanText;
  return { shortDesc, fullDesc: html };
}

// Real Black Lapel CDN image URLs (from live API)
const BL_CDN = 'https://cdn.shopify.com/s/files/1/0630/8164/4122/files';

export async function runBlackLapelSeed() {
  console.log('\n=============================================================');
  console.log('🚀 STITCHX PLUS — BLACK LAPEL LIVE DATA SEEDER');
  console.log('=============================================================\n');

  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Purge all collections
    console.log('🧹 Purging existing collections...');
    await Promise.all([
      UserModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      FabricModel.deleteMany({}),
      CustomizationOptionModel.deleteMany({}),
      ProductModel.deleteMany({}),
      CouponModel.deleteMany({}),
      MeasurementProfileModel.deleteMany({}),
      PageModel.deleteMany({}),
      SiteContentModel.deleteMany({}),
      ReviewModel.deleteMany({}),
    ]);
    console.log('✅ Collections purged\n');

    // 1. Admin Users
    const passwordHash = await hashPassword('Password123!');
    await UserModel.create([
      { name: 'Alexander Vance', email: 'admin@stitchxplus.com', password: passwordHash, role: 'ADMIN', phone: '+1 (212) 555-0199', isVerified: true },
      { name: 'Henry Cavendish', email: 'henry@stitchx.com', password: passwordHash, role: 'CUSTOMER', phone: '+1 (415) 555-0144', isVerified: true },
    ]);
    console.log('✅ Admin: admin@stitchxplus.com / Password123!\n');

    // 2. Categories — images from real Black Lapel CDN
    console.log('📂 Seeding Categories...');
    const createdCategories = await CategoryModel.create([
      {
        name: 'Custom Suits',
        slug: 'custom-suits',
        description: 'Impeccably tailored bespoke two-piece and three-piece custom suits made from premium Italian and British wools.',
        image: `${BL_CDN}/SUM101-03HERO-TheFoundationBlackHerringboneSuit_1.avif?v=1786386836`,
        sortOrder: 1, isActive: true,
        seo: { metaTitle: 'Custom Suits for Men | Stitchx Plus', metaDescription: 'Design your custom suit with exact measurements, lapels, and linings.' },
      },
      {
        name: 'Custom Blazers & Sport Coats',
        slug: 'custom-blazers',
        description: 'Tailored sport coats and blazers crafted for effortless versatility, business casual refinement, and weekend elegance.',
        image: `${BL_CDN}/SUM101-01_hero-_The_Foundation_Blue_on_Blue_Windowpane_Suit.avif?v=1786386118`,
        sortOrder: 2, isActive: true,
        seo: { metaTitle: 'Custom Blazers & Sport Coats | Stitchx Plus', metaDescription: 'Bespoke blazers designed to fit your posture and lifestyle.' },
      },
      {
        name: 'Tuxedos & Formalwear',
        slug: 'tuxedos',
        description: 'Black tie attire, dinner jackets, and tuxedos designed for weddings, galas, and life\'s grandest celebrations.',
        image: `${BL_CDN}/VP401-01hero3-TheReserveCharcoalChalkStripeSuit.avif?v=1786489105`,
        sortOrder: 3, isActive: true,
        seo: { metaTitle: 'Bespoke Tuxedos & Black Tie Attire | Stitchx Plus', metaDescription: 'Handcrafted tuxedos with satin peak lapels and custom linings.' },
      },
      {
        name: 'Custom Dress Shirts',
        slug: 'custom-shirts',
        description: 'Bespoke dress shirts cut to your exact body measurements in 100% long-staple Egyptian and Italian cottons.',
        image: `${BL_CDN}/SUM101-01_close_3-_The_Foundation_Blue_on_Blue_Windowpane_Suit.avif?v=1786386118`,
        sortOrder: 4, isActive: true,
        seo: { metaTitle: 'Custom Dress Shirts | Stitchx Plus', metaDescription: 'Tailored dress shirts with custom collars, cuffs, and monograms.' },
      },
      {
        name: 'Custom Trousers & Dress Pants',
        slug: 'custom-trousers',
        description: 'Hand-finished tailored trousers, dress pants, and casual flannels with custom waistbands, pleats, and side adjusters.',
        image: `${BL_CDN}/RP401-05hero_1_-TheReserveTanSuit.avif?v=1786494254`,
        sortOrder: 5, isActive: true,
        seo: { metaTitle: 'Custom Dress Pants & Trousers | Stitchx Plus', metaDescription: 'Bespoke dress pants cut to your ideal rise and leg drop.' },
      },
      {
        name: 'Outerwear & Overcoats',
        slug: 'outerwear',
        description: 'Luxurious wool, cashmere, and trench coats built for warmth, weather protection, and tailored sophistication.',
        image: `${BL_CDN}/RP401-07_HERO_2-_The_Reserve_Hunter_Green_Suit.avif?v=1786493388`,
        sortOrder: 6, isActive: true,
        seo: { metaTitle: 'Custom Overcoats & Winter Coats | Stitchx Plus', metaDescription: 'Heavyweight cashmere and wool coats tailored to fit over your suit.' },
      },
    ]);
    const catMap = new Map<string, string>();
    createdCategories.forEach((c) => catMap.set(c.slug, c._id.toString()));
    console.log(`✅ ${createdCategories.length} Categories seeded\n`);

    // 3. Fabrics — swatch images from real Black Lapel product macro/swatch shots
    console.log('🧵 Seeding Luxury Fabrics...');
    const createdFabrics = await FabricModel.create([
      {
        name: 'Vitale Barberis Canonico Super 130s Merino',
        code: 'VBC-130-NAVY',
        composition: '100% Super 130s Australian Merino Wool',
        weight: 280, weave: 'Twill', origin: 'Biella, Italy',
        color: 'Navy Blue', pattern: 'Solid Twill', season: 'All-Season',
        priceAdjustment: 0, priceMultiplier: 1.0,
        swatchImage: `${BL_CDN}/SUM101-03MACRO-TheFoundationBlackHerringboneSuit.avif?v=1786386836`,
        isAvailable: true,
      },
      {
        name: 'Reda 1865 Italian Flannel',
        code: 'REDA-FLN-CHARCOAL',
        composition: '100% Fine Merino Wool Flannel',
        weight: 320, weave: 'Flannel', origin: 'Biella, Italy',
        color: 'Charcoal Grey', pattern: 'Mélange Flannel', season: 'Fall/Winter',
        priceAdjustment: 150, priceMultiplier: 1.15,
        swatchImage: `${BL_CDN}/VP401-01micro-TheReserveCharcoalChalkStripeSuit.avif?v=1786489105`,
        isAvailable: true,
      },
      {
        name: 'Super 150s Wool Glen Plaid',
        code: 'S150-GLEN-BLUE',
        composition: '100% Super 150s Merino Wool',
        weight: 250, weave: 'Glen Plaid', origin: 'Biella, Italy',
        color: 'Midnight Blue', pattern: 'Glen Plaid', season: 'Spring/Summer',
        priceAdjustment: 350, priceMultiplier: 1.3,
        swatchImage: `${BL_CDN}/SUM101-01_macro-_The_Foundation_Blue_on_Blue_Windowpane_Suit.avif?v=1786386118`,
        isAvailable: true,
      },
      {
        name: 'Reserve Tan Tropical Wool',
        code: 'RES-TAN-TROP',
        composition: '100% Tropical Wool',
        weight: 200, weave: 'Plain Weave', origin: 'Italy',
        color: 'Tan', pattern: 'Solid', season: 'Spring/Summer',
        priceAdjustment: 100, priceMultiplier: 1.1,
        swatchImage: `${BL_CDN}/RP401-05SWATCH-TheReserveTanSuit.avif?v=1786494254`,
        isAvailable: true,
      },
      {
        name: 'Reserve Sharkskin Wool',
        code: 'RES-SHARK-GREY',
        composition: '100% Worsted Wool Sharkskin',
        weight: 270, weave: 'Sharkskin', origin: 'Italy',
        color: 'Grey', pattern: 'Sharkskin', season: 'All-Season',
        priceAdjustment: 200, priceMultiplier: 1.2,
        swatchImage: `${BL_CDN}/SWATCH-TheReserveGraySharkskinSuit.avif?v=1786488654`,
        isAvailable: true,
      },
      {
        name: 'Reserve Brick Red Wool Blend',
        code: 'RES-BRICK-RED',
        composition: '100% Wool Blend',
        weight: 260, weave: 'Twill', origin: 'Italy',
        color: 'Brick Red', pattern: 'Solid', season: 'Fall/Winter',
        priceAdjustment: 180, priceMultiplier: 1.18,
        swatchImage: `${BL_CDN}/RP401-06SWATCH-TheReserveBrickRedSuit.avif?v=1786493946`,
        isAvailable: true,
      },
    ]);
    console.log(`✅ ${createdFabrics.length} Fabrics seeded\n`);

    // 4. Customization Option Groups — images from real Black Lapel close-up/shoulder shots
    console.log('🎛️ Seeding Customization Option Groups...');
    const createdCustomizations = await CustomizationOptionModel.create([
      {
        group: 'Jacket Lapel Style',
        groupCode: 'lapel',
        isRequired: true, sortOrder: 1,
        compatibleProductTypes: ['SUIT', 'BLAZER', 'TUXEDO'],
        isActive: true,
        options: [
          {
            code: 'notch',
            name: 'Notch Lapel (Classic 3")',
            priceAdjustment: 0,
            image: `${BL_CDN}/SUM101-03HERO1-TheFoundationBlackHerringboneSuit_1.avif?v=1786386836`,
            description: 'Timeless, versatile lapel for business and everyday suiting.',
          },
          {
            code: 'peak',
            name: 'Peak Lapel (Bold 3.5")',
            priceAdjustment: 50,
            image: `${BL_CDN}/VP401-01hero4-TheReserveCharcoalChalkStripeSuit.avif?v=1786489105`,
            description: 'Commanding style that broadens shoulders and narrows waist silhouette.',
          },
          {
            code: 'shawl',
            name: 'Shawl Lapel (Formal Satin)',
            priceAdjustment: 75,
            image: `${BL_CDN}/RP401-07_HERO-_The_Reserve_Hunter_Green_Suit.avif?v=1786493388`,
            description: 'Smooth rounded satin collar reserved for evening black tie attire.',
          },
        ],
      },
      {
        group: 'Jacket Closure & Buttons',
        groupCode: 'buttoning',
        isRequired: true, sortOrder: 2,
        compatibleProductTypes: ['SUIT', 'BLAZER', 'TUXEDO'],
        isActive: true,
        options: [
          {
            code: 'sb2',
            name: 'Single Breasted 2-Button',
            priceAdjustment: 0,
            image: `${BL_CDN}/SUM101-03HERO-TheFoundationBlackHerringboneSuit_1.avif?v=1786386836`,
            description: 'The standard single-breasted classic silhouette.',
          },
          {
            code: 'sb1',
            name: 'Single Breasted 1-Button',
            priceAdjustment: 0,
            image: `${BL_CDN}/RP401-06hero-TheReserveBrickRedSuit.avif?v=1786493946`,
            description: 'Sleek, modern posture ideal for black-tie dinner jackets.',
          },
          {
            code: 'db6x2',
            name: 'Double Breasted 6x2',
            priceAdjustment: 60,
            image: `${BL_CDN}/VP401-03hero-TheReserveGraySharkskinSuit.avif?v=1786488653`,
            description: 'Regal double-breasted cut with horn buttons.',
          },
        ],
      },
      {
        group: 'Jacket Vent Style',
        groupCode: 'vents',
        isRequired: true, sortOrder: 3,
        compatibleProductTypes: ['SUIT', 'BLAZER', 'TUXEDO'],
        isActive: true,
        options: [
          {
            code: 'double_vent',
            name: 'Double Side Vents',
            priceAdjustment: 0,
            image: `${BL_CDN}/SUM101-03SHOULDER-TheFoundationBlackHerringboneSuit.avif?v=1786386836`,
            description: 'British tailoring standard allowing easy pocket access while seated.',
          },
          {
            code: 'single_vent',
            name: 'Single Center Vent',
            priceAdjustment: 0,
            image: `${BL_CDN}/VP401-03SHOULDER-TheReserveGraySharkskinSuit.avif?v=1786488653`,
            description: 'Clean American Ivy style center opening.',
          },
          {
            code: 'no_vent',
            name: 'Ventless (Zero Vents)',
            priceAdjustment: 0,
            image: `${BL_CDN}/VP401-01shoulder-TheReserveCharcoalChalkStripeSuit.avif?v=1786489105`,
            description: 'Ultra-clean formal back hem line.',
          },
        ],
      },
      {
        group: 'Jacket Lining Pattern',
        groupCode: 'lining',
        isRequired: true, sortOrder: 4,
        compatibleProductTypes: ['SUIT', 'BLAZER', 'TUXEDO'],
        isActive: true,
        options: [
          {
            code: 'solid_navy',
            name: 'Navy Bemberg Cupro Silk',
            priceAdjustment: 0,
            image: `${BL_CDN}/SUM101-03CLOSE1-TheFoundationBlackHerringboneSuit.avif?v=1786386836`,
            description: 'Breathable, hypoallergenic luxury interior lining.',
          },
          {
            code: 'gold_paisley',
            name: 'Gold Paisley Woven Silk',
            priceAdjustment: 45,
            image: `${BL_CDN}/VP401-02macro-TheReserveBlueTickWeaveSuit.avif?v=1786488902`,
            description: 'High-contrast decorative statement interior.',
          },
          {
            code: 'crimson_satin',
            name: 'Crimson Royal Satin',
            priceAdjustment: 40,
            image: `${BL_CDN}/RP401-06close3-TheReserveBrickRedSuit.avif?v=1786493946`,
            description: 'Rich burgundy satin interior.',
          },
        ],
      },
      {
        group: 'Trouser Pleat Style',
        groupCode: 'pleats',
        isRequired: true, sortOrder: 5,
        compatibleProductTypes: ['SUIT', 'TROUSER'],
        isActive: true,
        options: [
          {
            code: 'flat_front',
            name: 'Flat Front',
            priceAdjustment: 0,
            image: `${BL_CDN}/RP401-05medium-TheReserveTanSuit.avif?v=1786494254`,
            description: 'Modern, slim-cut flat front trouser.',
          },
          {
            code: 'single_pleat',
            name: 'Single Forward Pleat',
            priceAdjustment: 25,
            image: `${BL_CDN}/VP401-02MEDIUM-TheReserveBlueTickWeaveSuit.avif?v=1786488902`,
            description: 'Classic Italian single pleat for comfort and elegance.',
          },
          {
            code: 'double_pleat',
            name: 'Double Reverse Pleat',
            priceAdjustment: 40,
            image: `${BL_CDN}/RP401-06medium-TheReserveBrickRedSuit.avif?v=1786493946`,
            description: 'English country style double pleat for maximum comfort.',
          },
        ],
      },
      {
        group: 'Monogram & Personalization',
        groupCode: 'monogram',
        isRequired: false, sortOrder: 6,
        compatibleProductTypes: ['SUIT', 'BLAZER', 'TUXEDO', 'SHIRT'],
        isActive: true,
        options: [
          {
            code: 'no_monogram',
            name: 'No Monogram',
            priceAdjustment: 0,
            image: `${BL_CDN}/SUM101-03CLOSE5-TheFoundationBlackHerringboneSuit.avif?v=1786386836`,
            description: 'Clean interior without personalization.',
          },
          {
            code: 'chest_monogram',
            name: 'Chest Pocket Monogram',
            priceAdjustment: 35,
            image: `${BL_CDN}/RP401-07_MEDIUM-_The_Reserve_Hunter_Green_Suit.avif?v=1786493388`,
            description: 'Embroidered initials on chest breast pocket.',
          },
          {
            code: 'sleeve_monogram',
            name: 'Sleeve Cuff Monogram',
            priceAdjustment: 45,
            image: `${BL_CDN}/VS401-03_CLOSE_5-_The_Reserve_Pink_Windowpane_Suit_2.avif?v=1786487161`,
            description: 'Initials embroidered on the left sleeve cuff.',
          },
        ],
      },
    ]);

    const custIds = createdCustomizations.map((cg) => cg._id.toString());
    console.log(`✅ ${createdCustomizations.length} Customization Groups seeded\n`);

    // 5. Fetch & Seed Live Products
    const blProducts = await fetchAllBlackLapelProducts();
    console.log(`⚡ Transforming ${blProducts.length} products into database...`);

    const productDocs = [];
    let seededCount = 0;

    for (const p of blProducts) {
      if (!p.title || !p.variants || p.variants.length === 0) continue;

      const price = parseFloat(p.variants[0].price) || 899;
      const compareAtPrice = p.variants[0].compare_at_price
        ? parseFloat(p.variants[0].compare_at_price)
        : Math.round(price * 1.2);
      const titleLower = p.title.toLowerCase();
      const typeLower = (p.product_type || '').toLowerCase();

      // Category mapping
      let catSlug = 'custom-suits';
      if (typeLower.includes('blazer') || titleLower.includes('blazer') || titleLower.includes('sport coat')) {
        catSlug = 'custom-blazers';
      } else if (typeLower.includes('tuxedo') || titleLower.includes('tuxedo') || titleLower.includes('dinner jacket')) {
        catSlug = 'tuxedos';
      } else if (typeLower.includes('shirt') || titleLower.includes('shirt')) {
        catSlug = 'custom-shirts';
      } else if (typeLower.includes('pants') || typeLower.includes('trouser') || titleLower.includes('pants') || titleLower.includes('trousers')) {
        catSlug = 'custom-trousers';
      } else if (typeLower.includes('coat') || titleLower.includes('overcoat') || titleLower.includes('trench')) {
        catSlug = 'outerwear';
      }
      const catId = catMap.get(catSlug) || catMap.get('custom-suits')!;

      // Fabric mapping
      let fabIdx = 0;
      if (titleLower.includes('flannel') || titleLower.includes('chalk stripe')) fabIdx = 1;
      else if (titleLower.includes('plaid') || titleLower.includes('windowpane')) fabIdx = 2;
      else if (titleLower.includes('tan') || titleLower.includes('linen')) fabIdx = 3;
      else if (titleLower.includes('grey') || titleLower.includes('gray') || titleLower.includes('sharkskin')) fabIdx = 4;
      else if (titleLower.includes('red') || titleLower.includes('brick') || titleLower.includes('hunter')) fabIdx = 5;
      const fabId = createdFabrics[fabIdx]._id.toString();

      // Images — use real Black Lapel images only
      const images = p.images && p.images.length > 0
        ? p.images.map((img, idx) => ({
            url: img.src,
            altText: img.alt || `${p.title} – view ${idx + 1}`,
            isPrimary: idx === 0,
          }))
        : [{
            url: `${BL_CDN}/SUM101-03HERO-TheFoundationBlackHerringboneSuit_1.avif?v=1786386836`,
            altText: p.title,
            isPrimary: true,
          }];

      const { shortDesc, fullDesc } = cleanHtmlDescription(p.body_html);

      // Color extraction
      let colors: string[] = ['Navy', 'Black', 'Charcoal'];
      if (titleLower.includes('black')) colors = ['Black'];
      else if (titleLower.includes('navy') || titleLower.includes('blue')) colors = ['Navy', 'Blue'];
      else if (titleLower.includes('grey') || titleLower.includes('gray') || titleLower.includes('charcoal')) colors = ['Charcoal', 'Grey'];
      else if (titleLower.includes('tan') || titleLower.includes('beige')) colors = ['Tan', 'Beige'];
      else if (titleLower.includes('green')) colors = ['Hunter Green'];
      else if (titleLower.includes('red') || titleLower.includes('brick')) colors = ['Brick Red'];
      else if (titleLower.includes('pink')) colors = ['Pink'];
      else if (titleLower.includes('brown')) colors = ['Brown', 'Espresso'];
      else if (titleLower.includes('white')) colors = ['White'];

      productDocs.push({
        name: p.title,
        slug: p.handle || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        sku: p.variants[0].sku || `BL-${p.id}`,
        category: catId,
        fabricRef: fabId,
        customizationGroups: custIds,
        description: fullDesc,
        shortDescription: shortDesc,
        basePrice: price,
        compareAtPrice,
        currency: 'USD',
        images,
        availableFabrics: [fabId],
        colors,
        tags: p.tags && p.tags.length > 0 ? p.tags : ['Bespoke', 'Black Lapel', 'Custom Tailored'],
        inStock: true,
        isMadeToOrder: true,
        stockQuantity: 50,
        status: 'active',
        isFeatured: seededCount < 12,
        rating: +(4.5 + (seededCount % 6) * 0.08).toFixed(1),
        numReviews: 12 + (seededCount % 40),
      });
      seededCount++;
    }

    const insertedProducts = await ProductModel.insertMany(productDocs);
    console.log(`✅ ${insertedProducts.length} Products seeded\n`);

    // 6. Coupons
    await CouponModel.create([
      { code: 'BLACKLAPEL15', discountType: 'percentage', discountValue: 15, minPurchaseAmount: 500, expiresAt: new Date(Date.now() + 90 * 86400000), isActive: true, usageCount: 42 },
      { code: 'STITCHX100', discountType: 'fixed', discountValue: 100, minPurchaseAmount: 800, expiresAt: new Date(Date.now() + 60 * 86400000), isActive: true, usageCount: 18 },
    ]);

    console.log('=============================================================');
    console.log('🎉 SEEDING COMPLETE!');
    console.log(`   Admin: admin@stitchxplus.com / Password123!`);
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Fabrics: ${createdFabrics.length}`);
    console.log(`   Customization Groups: ${createdCustomizations.length}`);
    console.log(`   Products: ${insertedProducts.length}`);
    console.log('=============================================================\n');

  } catch (error) {
    console.error('\n❌ Fatal seeding error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

if (process.argv[1]?.includes('seedBlackLapel')) {
  runBlackLapelSeed();
}
