import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/appError';

// Configure Cloudinary from environment
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo_cloud';
const apiKey = process.env.CLOUDINARY_API_KEY || '1234567890';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'sample_secret';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export class CloudinaryService {
  /**
   * Generates a signed upload signature for direct browser-to-Cloudinary upload.
   */
  public generateUploadSignature(folder: string = 'stitchx_products') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return {
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    };
  }

  /**
   * Deletes an asset from Cloudinary by public_id.
   */
  public async deleteAsset(publicId: string) {
    if (!publicId) {
      throw new AppError('Public ID is required to delete Cloudinary asset', 400);
    }
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (err: any) {
      // Log error but don't crash app if remote asset isn't found
      console.warn(`Cloudinary deletion warning for ${publicId}:`, err.message);
      return { result: 'not_found_or_error' };
    }
  }
}
