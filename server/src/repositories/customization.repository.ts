import { CustomizationOptionModel, ICustomizationOptionDocument } from '../models/customizationOption.model.js';

export class CustomizationRepository {
  async getCustomizationGroups(productType: string = 'all'): Promise<ICustomizationOptionDocument[]> {
    const filter: any = { isActive: true };
    if (productType && productType !== 'all') {
      filter.$or = [{ compatibleProductTypes: 'all' }, { compatibleProductTypes: productType }];
    }
    return CustomizationOptionModel.find(filter).sort({ sortOrder: 1 }).exec();
  }

  async getGroupByCode(groupCode: string): Promise<ICustomizationOptionDocument | null> {
    return CustomizationOptionModel.findOne({ groupCode, isActive: true }).exec();
  }

  async seedDefaultOptionsIfEmpty(): Promise<void> {
    const count = await CustomizationOptionModel.countDocuments();
    if (count > 0) return;

    const defaultGroups = [
      {
        group: 'Fabric',
        groupCode: 'fabric',
        isRequired: true,
        sortOrder: 1,
        compatibleProductTypes: ['all'],
        isActive: true,
        options: [
          {
            code: 'fabric-super130',
            name: 'Super 130s Merino Wool',
            priceAdjustment: 0,
            description: '100% Australian Super 130s All-Season Wool',
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'fabric-super150',
            name: 'Super 150s Italian Fine Wool',
            priceAdjustment: 120,
            description: 'Loro Piana 100% Super 150s Extra Fine Wool',
            image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'fabric-cashmere',
            name: 'Virgin Wool & Cashmere Blend',
            priceAdjustment: 250,
            description: 'Luxurious 80% Wool & 20% Cashmere Blend',
            image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80',
          },
        ],
      },
      {
        group: 'Jacket style',
        groupCode: 'jacketStyle',
        isRequired: true,
        sortOrder: 2,
        compatibleProductTypes: ['all'],
        isActive: true,
        options: [
          {
            code: 'jacket-single-2b',
            name: 'Single Breasted (2 Button)',
            priceAdjustment: 0,
            description: 'Classic versatile two-button silhouette',
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'jacket-single-1b',
            name: 'Single Breasted (1 Button)',
            priceAdjustment: 0,
            description: 'Sleek single-button evening cut',
            image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'jacket-double-6b',
            name: 'Double Breasted (6 Button)',
            priceAdjustment: 50,
            description: 'Commanding 6x2 double-breasted structure',
            image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=400&q=80',
          },
        ],
      },
      {
        group: 'Lapel',
        groupCode: 'lapel',
        isRequired: true,
        sortOrder: 3,
        compatibleProductTypes: ['all'],
        isActive: true,
        options: [
          {
            code: 'lapel-notch',
            name: 'Classic Notch Lapel',
            priceAdjustment: 0,
            description: 'Standard 3-inch notch lapel',
            image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'lapel-peak',
            name: 'Bold Peak Lapel',
            priceAdjustment: 30,
            description: 'Elongating 3.5-inch peak lapel',
            image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'lapel-shawl',
            name: 'Satin Shawl Collar',
            priceAdjustment: 60,
            description: 'Smooth tuxedo-style shawl lapel',
            image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
            incompatibleWith: ['jacket-double-6b'],
          },
        ],
      },
      {
        group: 'Buttons',
        groupCode: 'buttons',
        isRequired: true,
        sortOrder: 4,
        compatibleProductTypes: ['all'],
        isActive: true,
        options: [
          {
            code: 'btn-horn',
            name: 'Genuine Buffalo Horn Buttons',
            priceAdjustment: 0,
            description: 'Hand-burnished natural dark horn',
            image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'btn-mop',
            name: 'Mother of Pearl Shell Buttons',
            priceAdjustment: 25,
            description: 'Iridescent Australian pearl shell',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'btn-brass',
            name: 'Antique Brass Crest Buttons',
            priceAdjustment: 35,
            description: 'Vintage engraved brass buttons',
            image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80',
          },
        ],
      },
      {
        group: 'Pockets',
        groupCode: 'pockets',
        isRequired: true,
        sortOrder: 5,
        compatibleProductTypes: ['all'],
        isActive: true,
        options: [
          {
            code: 'pocket-flap',
            name: 'Flap Pockets + Ticket Pocket',
            priceAdjustment: 0,
            description: 'Traditional slant flap pockets with ticket pocket',
            image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'pocket-jetted',
            name: 'Sleek Jetted Pockets',
            priceAdjustment: 0,
            description: 'Clean double-jetted minimalist pockets',
            image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'pocket-patch',
            name: 'Casual Patch Pockets',
            priceAdjustment: 15,
            description: 'Relaxed exterior patch pockets',
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80',
          },
        ],
      },
      {
        group: 'Vents',
        groupCode: 'vents',
        isRequired: true,
        sortOrder: 6,
        compatibleProductTypes: ['all'],
        isActive: true,
        options: [
          {
            code: 'vent-double',
            name: 'Double Side Vents',
            priceAdjustment: 0,
            description: 'Classic British twin side vents for sitting comfort',
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'vent-single',
            name: 'Single Center Vent',
            priceAdjustment: 0,
            description: 'American center vent design',
            image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'vent-none',
            name: 'Ventless European Fit',
            priceAdjustment: 0,
            description: 'Ultra-clean fitted Italian back without vents',
            image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
          },
        ],
      },
      {
        group: 'Lining',
        groupCode: 'lining',
        isRequired: true,
        sortOrder: 7,
        compatibleProductTypes: ['all'],
        isActive: true,
        options: [
          {
            code: 'lining-navy-cupro',
            name: 'Navy Bemberg Cupro',
            priceAdjustment: 0,
            description: 'Breathable 100% Cupro silk-like lining',
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'lining-gold-paisley',
            name: 'Gold Silk Paisley',
            priceAdjustment: 45,
            description: 'Statement jacquard woven gold paisley',
            image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'lining-monogrammed',
            name: 'Custom Monogrammed Silk',
            priceAdjustment: 75,
            description: 'Personalized initials embroidered into silk lining',
            image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80',
          },
        ],
      },
      {
        group: 'Trousers',
        groupCode: 'trousers',
        isRequired: true,
        sortOrder: 8,
        compatibleProductTypes: ['all'],
        isActive: true,
        options: [
          {
            code: 'trouser-flat-front',
            name: 'Flat Front Slim Trousers',
            priceAdjustment: 0,
            description: 'Modern clean front without pleats',
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'trouser-single-pleat',
            name: 'Single Pleat Classic Trousers',
            priceAdjustment: 20,
            description: 'Subtle forward pleat for extra thigh room',
            image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
          },
          {
            code: 'trouser-side-adjusters',
            name: 'Side Adjusters (No Belt Loops)',
            priceAdjustment: 25,
            description: 'Savile Row brass side buckles without belt loops',
            image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=400&q=80',
          },
        ],
      },
    ];

    await CustomizationOptionModel.insertMany(defaultGroups);
  }
}
