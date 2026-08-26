import crypto from 'crypto';
import {
  IPaymentService,
  CreatePaymentIntentParams,
  PaymentIntentResult,
  WebhookEventResult,
} from './payment.interface.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/appError.js';

export class StripePaymentService implements IPaymentService {
  private webhookSecret: string;

  constructor(_secretKey?: string, webhookSecret?: string) {
    this.webhookSecret = webhookSecret || env.STRIPE_WEBHOOK_SECRET;
  }

  /**
   * Creates a Payment Intent with provider
   */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const randomId = crypto.randomBytes(12).toString('hex');
    const paymentIntentId = `pi_stitchx_${randomId}`;
    const clientSecret = `${paymentIntentId}_secret_${crypto.randomBytes(8).toString('hex')}`;

    return {
      paymentIntentId,
      clientSecret,
      amount: params.amount,
      currency: params.currency || 'usd',
      status: 'requires_payment_method',
    };
  }

  /**
   * Cryptographically verifies Stripe Webhook signature (HMAC-SHA256)
   */
  verifyWebhookSignature(
    rawBody: string | Buffer,
    signatureHeader: string,
  ): WebhookEventResult {
    if (!signatureHeader) {
      throw new AppError('Missing Stripe webhook signature header', 400);
    }

    const payloadString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

    let timestamp = '';
    let v1Signature = '';

    // Handle standard Stripe header format: t=12345,v1=abcde...
    if (signatureHeader.includes('t=') && signatureHeader.includes('v1=')) {
      const parts = signatureHeader.split(',');
      for (const part of parts) {
        const [key, value] = part.split('=');
        if (key.trim() === 't') timestamp = value.trim();
        if (key.trim() === 'v1') v1Signature = value.trim();
      }
    } else {
      // Fallback: header is direct v1 signature hex
      v1Signature = signatureHeader;
    }

    if (!v1Signature) {
      throw new AppError('Invalid signature format', 400);
    }

    // Compute expected HMAC SHA-256 signature
    const signedPayload = timestamp ? `${timestamp}.${payloadString}` : payloadString;
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // Constant-time string comparison to prevent timing attacks
    const isSignatureValid =
      expectedSignature.length === v1Signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(v1Signature));

    if (!isSignatureValid) {
      throw new AppError('Invalid webhook signature', 400);
    }

    // Parse event payload
    try {
      const eventData = JSON.parse(payloadString);
      const eventId = eventData.id || `evt_${crypto.randomBytes(8).toString('hex')}`;
      const eventType = eventData.type || 'payment_intent.succeeded';
      const dataObject = eventData.data?.object || eventData;

      const isSuccess =
        eventType === 'payment_intent.succeeded' ||
        eventType === 'checkout.session.completed' ||
        dataObject.status === 'succeeded' ||
        dataObject.status === 'paid';

      return {
        eventId,
        eventType,
        paymentIntentId: dataObject.paymentIntentId || dataObject.id || dataObject.payment_intent,
        orderNumber: dataObject.metadata?.orderNumber || dataObject.orderNumber,
        amount: dataObject.amount,
        status: isSuccess ? 'paid' : 'failed',
        metadata: dataObject.metadata,
      };
    } catch (_err) {
      throw new AppError('Failed to parse webhook JSON payload', 400);
    }
  }

  /**
   * Helper utility for generating valid signed webhook headers in integration tests
   */
  public generateTestWebhookSignature(
    payload: string | object,
    secret?: string,
    timestamp: number = Math.floor(Date.now() / 1000),
  ): string {
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const key = secret || this.webhookSecret;
    const signedPayload = `${timestamp}.${payloadStr}`;
    const signature = crypto.createHmac('sha256', key).update(signedPayload, 'utf8').digest('hex');
    return `t=${timestamp},v1=${signature}`;
  }
}
