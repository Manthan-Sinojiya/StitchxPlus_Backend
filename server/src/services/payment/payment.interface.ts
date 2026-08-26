export interface CreatePaymentIntentParams {
  amount: number; // in cents, e.g., 95000 for $950.00
  currency: string;
  orderNumber: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface WebhookEventResult {
  eventId: string;
  eventType: string;
  paymentIntentId: string;
  orderNumber?: string;
  amount?: number;
  status: 'paid' | 'failed';
  metadata?: Record<string, string>;
}

export interface IPaymentService {
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): WebhookEventResult;
}
