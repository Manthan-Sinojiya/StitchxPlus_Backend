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

  private renderOrderItemsHtml(items: any[] = []): string {
    if (!items || items.length === 0) {
      return '<p style="color: #64748b; font-style: italic;">No line items found.</p>';
    }

    return items
      .map((item: any) => {
        const prodName = item.product?.name || item.name || 'Bespoke Suit Garment';
        const prodSku = item.product?.sku || item.sku || 'STX-BESPOKE';
        const colorName = item.selectedColor?.name || (typeof item.selectedColor === 'string' ? item.selectedColor : null);
        const sizeVal = item.selectedSize || 'Custom Profile';
        const imgUrl = item.product?.image || (item.product?.images && item.product.images[0]) || '';
        const qty = item.quantity || 1;
        const unitPx = item.unitPrice || item.priceAtAddition || 0;
        const totalPx = item.totalPrice || unitPx * qty;

        let customizationHtml = '';
        if (item.customization) {
          const opts = item.customization.optionAdjustments || [];
          const selMap = item.customization.selectedOptions || {};

          if (opts.length > 0) {
            customizationHtml = `
              <div style="margin-top: 8px; padding: 10px; background-color: #f8fafc; border-left: 3px solid #d97706; border-radius: 4px; font-size: 12px; color: #334155;">
                <strong style="color: #92400e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">✨ Bespoke Customization Options:</strong>
                <ul style="margin: 0; padding-left: 16px;">
                  ${opts
                    .map(
                      (o: any) =>
                        `<li><strong>${o.group}:</strong> ${o.optionName} ${o.priceAdjustment > 0 ? `(+$${o.priceAdjustment})` : '(Included)'}</li>`,
                    )
                    .join('')}
                </ul>
              </div>
            `;
          } else if (Object.keys(selMap).length > 0) {
            customizationHtml = `
              <div style="margin-top: 8px; padding: 10px; background-color: #f8fafc; border-left: 3px solid #d97706; border-radius: 4px; font-size: 12px; color: #334155;">
                <strong style="color: #92400e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">✨ Bespoke Customization Choices:</strong>
                <ul style="margin: 0; padding-left: 16px;">
                  ${Object.entries(selMap)
                    .map(([grp, val]) => `<li><strong>${grp}:</strong> ${val}</li>`)
                    .join('')}
                </ul>
              </div>
            `;
          }
        }

        let measurementHtml = '';
        if (item.measurementProfile) {
          const m = item.measurementProfile;
          const unit = m.unit || 'inches';
          measurementHtml = `
            <div style="margin-top: 8px; padding: 10px; background-color: #f0fdf4; border-left: 3px solid #16a34a; border-radius: 4px; font-size: 12px; color: #166534;">
              <strong style="color: #15803d; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">📏 3D Fit & Measurement Profile (${m.name || 'Personal Scan'}):</strong>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px; margin-top: 4px;">
                ${m.chest ? `<span>Chest: <strong>${m.chest} ${unit}</strong></span> | ` : ''}
                ${m.waist ? `<span>Waist: <strong>${m.waist} ${unit}</strong></span> | ` : ''}
                ${m.shoulder ? `<span>Shoulder: <strong>${m.shoulder} ${unit}</strong></span> | ` : ''}
                ${m.sleeve ? `<span>Sleeve: <strong>${m.sleeve} ${unit}</strong></span> | ` : ''}
                ${m.jacketLength ? `<span>Length: <strong>${m.jacketLength} ${unit}</strong></span> | ` : ''}
                ${m.trouserWaist ? `<span>Pants Waist: <strong>${m.trouserWaist} ${unit}</strong></span> | ` : ''}
                ${m.inseam ? `<span>Inseam: <strong>${m.inseam} ${unit}</strong></span> | ` : ''}
                ${m.fitPreference ? `<span>Fit Preference: <strong>${m.fitPreference.toUpperCase()}</strong></span>` : ''}
              </div>
            </div>
          `;
        }

        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 14px 10px; vertical-align: top;">
              <div style="display: flex; gap: 12px;">
                ${imgUrl ? `<img src="${imgUrl}" alt="${prodName}" style="width: 64px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;" />` : ''}
                <div>
                  <h4 style="margin: 0 0 4px 0; color: #0f172a; font-size: 14px;">${prodName}</h4>
                  <p style="margin: 0; color: #64748b; font-size: 12px;">SKU: ${prodSku} ${colorName ? `| Color: ${colorName}` : ''} | Size: ${sizeVal}</p>
                  ${customizationHtml}
                  ${measurementHtml}
                </div>
              </div>
            </td>
            <td style="padding: 14px 10px; vertical-align: top; text-align: center; font-size: 13px; color: #334155; font-weight: 600;">
              ${qty}
            </td>
            <td style="padding: 14px 10px; vertical-align: top; text-align: right; font-size: 13px; color: #334155;">
              $${unitPx.toFixed(2)}
            </td>
            <td style="padding: 14px 10px; vertical-align: top; text-align: right; font-size: 14px; font-weight: 700; color: #0f172a;">
              $${totalPx.toFixed(2)}
            </td>
          </tr>
        `;
      })
      .join('');
  }

  async sendOrderConfirmationEmail(order: any, email: string): Promise<boolean> {
    const shipping = order.shippingAddress || {};
    const recipientName = `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim() || 'Valued Customer';
    const itemsTable = this.renderOrderItemsHtml(order.items || []);

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #0f172a;">
        <!-- Header Banner -->
        <div style="background-color: #091527; padding: 28px 24px; text-align: center;">
          <h1 style="margin: 0; color: #fbbf24; font-family: Georgia, serif; font-size: 26px; letter-spacing: 1px;">STITCHX PLUS LLC</h1>
          <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Bespoke Sartorial Excellence</p>
        </div>

        <!-- Order Greeting & Summary -->
        <div style="padding: 24px;">
          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 6px 0; color: #78350f; font-size: 18px; font-family: Georgia, serif;">Order Confirmed: #${order.orderNumber}</h2>
            <p style="margin: 0; color: #92400e; font-size: 13px; leading-height: 1.4;">
              Dear ${recipientName}, thank you for placing your bespoke order with Stitchx Plus LLC. Our master tailors have received your garment specifications and queued your order for handcrafted production.
            </p>
          </div>

          <!-- Shipping & Customer Info Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: 1px;">Shipping & Delivery Details</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${recipientName}</p>
            <p style="margin: 0; font-size: 13px; color: #334155;">${shipping.addressLine1 || ''} ${shipping.addressLine2 || ''}</p>
            <p style="margin: 0; font-size: 13px; color: #334155;">${shipping.city || ''}, ${shipping.state || ''} ${shipping.postalCode || ''}, ${shipping.country || ''}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Phone: ${shipping.phone || 'N/A'} | Email: ${email}</p>
          </div>

          <!-- Line Items Table -->
          <h3 style="margin: 0 0 12px 0; font-size: 15px; font-family: Georgia, serif; color: #0f172a;">Order Items & Custom Specifications</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">
                <th style="padding: 10px;">Item Description</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Unit Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTable}
            </tbody>
          </table>

          <!-- Financial Calculation Summary -->
          <div style="width: 280px; margin-left: auto; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #475569;">
              <span>Subtotal:</span>
              <span>$${(order.subtotal || 0).toFixed(2)}</span>
            </div>
            ${order.discount ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #16a34a;">
              <span>Discount:</span>
              <span>-$${order.discount.toFixed(2)}</span>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #475569;">
              <span>Shipping Fee:</span>
              <span>$${(order.shipping || 0).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 2px solid #cbd5e1; font-size: 16px; font-weight: 700; color: #0f172a;">
              <span>Total Paid:</span>
              <span style="color: #92400e;">$${(order.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          <!-- Policy Guarantee Footer Notice -->
          <div style="background-color: #091527; color: #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; font-size: 12px; line-height: 1.5;">
            <strong style="color: #fbbf24; display: block; margin-bottom: 4px;">30-Day Hassle-Free Return & Perfect Fit Guarantee</strong>
            All Stitchx Plus garments are backed by our 100% Fit Guarantee. If any adjustments are needed, contact our concierges within 30 days for complimentary alterations or replacements.
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Bespoke Order Confirmation #${order.orderNumber} — Stitchx Plus LLC`,
      html: htmlContent,
    });
  }

  async sendPaymentConfirmationEmail(order: any, email: string): Promise<boolean> {
    return this.sendOrderConfirmationEmail(order, email);
  }

  async sendShipmentEmail(order: any, email: string, trackingNumber = 'STX-TRK-98412'): Promise<boolean> {
    const shipping = order.shippingAddress || {};
    const recipientName = `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim() || 'Valued Customer';
    const itemsTable = this.renderOrderItemsHtml(order.items || []);

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #0f172a;">
        <div style="background-color: #091527; padding: 28px 24px; text-align: center;">
          <h1 style="margin: 0; color: #fbbf24; font-family: Georgia, serif; font-size: 26px;">STITCHX PLUS LLC</h1>
          <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Garment Shipment Dispatch</p>
        </div>

        <div style="padding: 24px;">
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 6px 0; color: #15803d; font-size: 18px; font-family: Georgia, serif;">Order #${order.orderNumber} Has Shipped!</h2>
            <p style="margin: 0; color: #166534; font-size: 13px;">
              Dear ${recipientName}, your tailored garment has passed master inspection and has been dispatched for express delivery.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; font-weight: 700; color: #0f172a;">
              Tracking Reference: <span style="font-family: monospace; color: #2563eb; background-color: #eff6ff; padding: 3px 8px; border-radius: 4px;">${trackingNumber}</span>
            </p>
          </div>

          <h3 style="margin: 0 0 12px 0; font-size: 15px; font-family: Georgia, serif; color: #0f172a;">Shipped Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">
                <th style="padding: 10px;">Item Description</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Unit Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTable}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Your Bespoke Order #${order.orderNumber} Has Shipped — Stitchx Plus LLC`,
      html: htmlContent,
    });
  }

  async sendCancellationEmail(order: any, email: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Order #${order.orderNumber} Cancellation Notice — Stitchx Plus LLC`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #991b1b;">Order Cancellation Notice</h2>
          <p>Order <strong>#${order.orderNumber}</strong> has been cancelled.</p>
          <p>Any funds debited for this order will be refunded to your original payment method within 3 to 5 business days.</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">If you have any questions, please reply directly to this email or contact support@stitchxplus.com.</p>
        </div>
      `,
    });
  }

  async sendOrderStatusUpdateEmail(email: string, name: string, orderNumber: string, status: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Order #${orderNumber} Status Updated to ${status.toUpperCase()} — Stitchx Plus LLC`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #091527; font-family: Georgia, serif;">Order Status Update</h2>
          <p>Dear ${name},</p>
          <p>The status of your order <strong>#${orderNumber}</strong> has been updated to: <strong style="color: #d97706; text-transform: uppercase;">${status}</strong>.</p>
          <p style="color: #64748b; font-size: 13px; margin-top: 20px;">You can view the full progress of your garment in your customer account dashboard at any time.</p>
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
