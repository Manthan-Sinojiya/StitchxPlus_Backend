import { Request, Response, NextFunction } from 'express';
import { CustomizationService } from '../services/customization.service.js';
import { sendSuccess } from '../utils/response.js';

const customizationService = new CustomizationService();

export async function getProductCustomization(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const result = await customizationService.getCustomizationForProduct(id);
    sendSuccess(res, result, 'Customization options retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function calculateCustomizationPrice(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { productId, productSlug, selectedOptions, basePrice } = req.body;
    const result = await customizationService.calculatePrice(
      productId || productSlug,
      selectedOptions,
      basePrice,
    );
    sendSuccess(res, result, 'Customization price calculated successfully');
  } catch (error) {
    next(error);
  }
}

export async function validateCustomizationConfig(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { productId, productSlug, selectedOptions } = req.body;
    const result = await customizationService.validateConfiguration(
      productId || productSlug,
      selectedOptions,
    );
    sendSuccess(res, result, 'Customization validation completed');
  } catch (error) {
    next(error);
  }
}
