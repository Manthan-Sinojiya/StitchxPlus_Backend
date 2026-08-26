import { logger } from '../utils/logger.js';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailService {
  sendEmail(payload: EmailPayload): Promise<boolean>;
  sendRegistrationEmail(user: { email: string; name: string }): Promise<boolean>;
  sendOrderConfirmationEmail(order: any, email: string): Promise<boolean>;
  sendPaymentConfirmationEmail(order: any, email: string): Promise<boolean>;
  sendShipmentEmail(order: any, email: string, trackingNumber?: string): Promise<boolean>;
  sendCancellationEmail(order: any, email: string): Promise<boolean>;
}

export class TransactionalEmailService implements IEmailService {
  private providerName: string;

  constructor() {
    this.providerName = process.env.EMAIL_PROVIDER || 'mock';
  }

  async sendEmail(payload: EmailPayload): Promise<boolean> {
    logger.info(`[EmailService:${this.providerName}] Sending email to ${payload.to} | Subject: "${payload.subject}"`);
    
    // In production, integration with Resend / SendGrid / AWS SES:
    // e.g. await resend.emails.send({ from: 'Stitchx Plus <orders@stitchx.com>', ...payload });
    
    return true;
  }

  async sendRegistrationEmail(user: { email: string; name: string }): Promise<boolean> {
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to Stitchx Plus LLC — Bespoke Sartorial Excellence',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0a192f;">
          <h2 style="color: #0a192f;">Welcome, ${user.name}!</h2>
          <p>Thank you for creating an account with Stitchx Plus LLC.</p>
          <p>Your bespoke measurement profile, custom order history, and exclusive fabric selections are now available in your customer account dashboard.</p>
        </div>
      `,
    });
  }

  async sendOrderConfirmationEmail(order: any, email: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Order #${order.orderNumber} Confirmed — Stitchx Plus LLC`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0a192f;">
          <h2>Bespoke Order Confirmation</h2>
          <p>Your order <strong>#${order.orderNumber}</strong> has been received and queued for master tailoring.</p>
          <p>Total Amount: <strong>$${order.totalAmount} USD</strong></p>
        </div>
      `,
    });
  }

  async sendPaymentConfirmationEmail(order: any, email: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Payment Confirmed for Order #${order.orderNumber}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0a192f;">
          <h2>Payment Received</h2>
          <p>Payment for order <strong>#${order.orderNumber}</strong> has been verified. Production on your garment has commenced.</p>
        </div>
      `,
    });
  }

  async sendShipmentEmail(order: any, email: string, trackingNumber = 'STX-TRK-98412'): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Your Bespoke Garment Has Shipped — Order #${order.orderNumber}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0a192f;">
          <h2>Garment Dispatch Notification</h2>
          <p>Order <strong>#${order.orderNumber}</strong> has completed final tailoring inspection and is on its way to you.</p>
          <p>Tracking Number: <strong>${trackingNumber}</strong></p>
        </div>
      `,
    });
  }

  async sendCancellationEmail(order: any, email: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Order #${order.orderNumber} Cancelled`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0a192f;">
          <h2>Order Cancellation Notice</h2>
          <p>Order <strong>#${order.orderNumber}</strong> has been cancelled. Any processed payment will be refunded within 3-5 business days.</p>
        </div>
      `,
    });
  }

  async sendOrderStatusUpdateEmail(email: string, name: string, orderNumber: string, status: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Order #${orderNumber} Status Updated: ${status}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0a192f;">
          <h2>Order Status Update</h2>
          <p>Dear ${name},</p>
          <p>Your bespoke order <strong>#${orderNumber}</strong> has been updated to status: <strong>${status}</strong>.</p>
        </div>
      `,
    });
  }

  static async sendOrderStatusUpdateEmail(email: string, name: string, orderNumber: string, status: string): Promise<boolean> {
    return emailService.sendOrderStatusUpdateEmail(email, name, orderNumber, status);
  }

  static async sendOrderShippedEmail(email: string, _name: string, orderNumber: string, trackingNumber?: string): Promise<boolean> {
    return emailService.sendShipmentEmail({ orderNumber }, email, trackingNumber);
  }
}

export const emailService = new TransactionalEmailService();
