import mongoose from 'mongoose';
import { CustomizationRepository } from '../repositories/customization.repository.js';
import { ProductRepository } from '../repositories/product.repository.js';
import {
  CustomizationOptionGroup,
  CustomizationPriceResponse,
  CustomizationValidateResponse,
} from '@stitchx/shared';

export class CustomizationService {
  private customizationRepository: CustomizationRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.customizationRepository = new CustomizationRepository();
    this.productRepository = new ProductRepository();
  }

  async getCustomizationForProduct(productIdOrSlug: string): Promise<{
    product: { id: string; name: string; slug: string; basePrice: number; fitType?: string; images?: any[] } | null;
    groups: CustomizationOptionGroup[];
  }> {
    await this.customizationRepository.seedDefaultOptionsIfEmpty();

    let product = null;
    if (productIdOrSlug && productIdOrSlug !== 'default') {
      product = await this.productRepository.findBySlug(productIdOrSlug);
      if (!product && mongoose.isValidObjectId(productIdOrSlug)) {
        product = await this.productRepository.findById(productIdOrSlug);
      }
    }

    const rawGroups = await this.customizationRepository.getCustomizationGroups('all');

    let processedGroups = rawGroups;

    if (product) {
      if (product.isCustomizable === false) {
        return {
          product: {
            id: product.id || (product as any)._id?.toString(),
            name: product.name,
            slug: product.slug,
            basePrice: product.basePrice,
            fitType: product.fitType || 'Tailored Fit',
            images: product.images || [],
          },
          groups: [],
        };
      }

      if (product.customizationRules && product.customizationRules.length > 0) {
        const ruleMap = new Map<string, string[] | undefined>();
        product.customizationRules.forEach((r) => {
          ruleMap.set(r.groupCode, r.allowedOptionCodes);
        });

        processedGroups = rawGroups
          .filter((g) => ruleMap.has(g.groupCode))
          .map((g) => {
            const doc = (g as any).toObject ? (g as any).toObject() : { ...g };
            const allowed = ruleMap.get(g.groupCode);
            if (allowed && allowed.length > 0) {
              doc.options = (doc.options || []).filter((opt: any) => allowed.includes(opt.code));
            }
            return doc;
          });
      } else if (product.customizationGroups && product.customizationGroups.length > 0) {
        processedGroups = rawGroups.filter((g) =>
          product.customizationGroups?.includes(g.groupCode),
        );
      }
    }

    const groups: CustomizationOptionGroup[] = processedGroups.map((g: any) => ({
      id: g.id || g._id?.toString(),
      group: g.group,
      groupCode: g.groupCode,
      isRequired: g.isRequired,
      sortOrder: g.sortOrder,
      compatibleProductTypes: g.compatibleProductTypes,
      options: (g.options || []).map((opt: any) => ({
        code: opt.code,
        name: opt.name,
        priceAdjustment: opt.priceAdjustment,
        image: opt.image,
        description: opt.description,
        incompatibleWith: opt.incompatibleWith || [],
      })),
      isActive: g.isActive,
    }));

    return {
      product: product
        ? {
            id: product.id || (product as any)._id?.toString(),
            name: product.name,
            slug: product.slug,
            basePrice: product.basePrice,
            fitType: product.fitType || 'Tailored Fit',
            images: product.images || [],
          }
        : null,
      groups,
    };
  }

  async calculatePrice(
    productIdOrSlug?: string,
    selectedOptions: Record<string, string> = {},
    basePriceOverride?: number,
  ): Promise<CustomizationPriceResponse> {
    await this.customizationRepository.seedDefaultOptionsIfEmpty();

    let basePrice = 899; // Standard fallback base price for bespoke suit

    if (productIdOrSlug && productIdOrSlug !== 'default') {
      const product =
        (await this.productRepository.findBySlug(productIdOrSlug)) ||
        (mongoose.isValidObjectId(productIdOrSlug) ? await this.productRepository.findById(productIdOrSlug) : null);
      if (product) {
        basePrice = product.basePrice;
      } else if (basePriceOverride && basePriceOverride > 0) {
        basePrice = basePriceOverride;
      }
    } else if (basePriceOverride && basePriceOverride > 0) {
      basePrice = basePriceOverride;
    }

    const groups = await this.customizationRepository.getCustomizationGroups('all');

    const optionAdjustments: CustomizationPriceResponse['optionAdjustments'] = [];
    let totalAdjustments = 0;

    for (const [groupCode, selectedCode] of Object.entries(selectedOptions)) {
      if (!selectedCode) continue;

      const group = groups.find((g) => g.groupCode === groupCode);
      if (!group) continue;

      const option = group.options.find((opt) => opt.code === selectedCode);
      if (!option) continue;

      const priceAdj = Number(option.priceAdjustment) || 0;
      totalAdjustments += priceAdj;

      optionAdjustments.push({
        group: group.group,
        groupCode: group.groupCode,
        optionCode: option.code,
        optionName: option.name,
        priceAdjustment: priceAdj,
      });
    }

    return {
      basePrice,
      optionAdjustments,
      totalAdjustments,
      totalPrice: basePrice + totalAdjustments,
    };
  }

  async validateConfiguration(
    _productIdOrSlug?: string,
    selectedOptions: Record<string, string> = {},
  ): Promise<CustomizationValidateResponse> {
    await this.customizationRepository.seedDefaultOptionsIfEmpty();

    const groups = await this.customizationRepository.getCustomizationGroups('all');
    const errors: string[] = [];

    // Map code -> option name for clear error messaging
    const optionCodeToNameMap = new Map<string, string>();
    const optionCodeToIncompatibleMap = new Map<string, string[]>();

    for (const group of groups) {
      for (const opt of group.options) {
        optionCodeToNameMap.set(opt.code, opt.name);
        if (opt.incompatibleWith && opt.incompatibleWith.length > 0) {
          optionCodeToIncompatibleMap.set(opt.code, opt.incompatibleWith);
        }
      }
    }

    // 1. Check required groups
    for (const group of groups) {
      if (group.isRequired) {
        const selectedCode = selectedOptions[group.groupCode];
        if (!selectedCode) {
          errors.push(`Please select an option for ${group.group}`);
        } else {
          // Check option exists in group
          const exists = group.options.some((o) => o.code === selectedCode);
          if (!exists) {
            errors.push(`Invalid selection '${selectedCode}' for ${group.group}`);
          }
        }
      }
    }

    // 2. Check incompatible combinations
    const selectedCodesList = Object.values(selectedOptions).filter(Boolean);

    for (const code of selectedCodesList) {
      const incompatibleCodes = optionCodeToIncompatibleMap.get(code);
      if (incompatibleCodes && incompatibleCodes.length > 0) {
        for (const incCode of incompatibleCodes) {
          if (selectedCodesList.includes(incCode)) {
            const nameA = optionCodeToNameMap.get(code) || code;
            const nameB = optionCodeToNameMap.get(incCode) || incCode;
            errors.push(`'${nameA}' is incompatible with '${nameB}'`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
