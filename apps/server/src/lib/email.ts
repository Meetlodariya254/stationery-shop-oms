/**
 * Nodemailer Email Service
 * Sends order confirmation emails to the shop owner with full order details.
 */

import nodemailer from 'nodemailer';
import { logger } from './logger';

interface OrderEmailData {
  customerName: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  grandTotal: number;
  specialInstructions?: string;
  preferredDeliveryDate?: string;
  gstNumber?: string;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env['SMTP_HOST'] ?? 'smtp.gmail.com',
    port: parseInt(process.env['SMTP_PORT'] ?? '587'),
    secure: process.env['SMTP_SECURE'] === 'true',
    auth: {
      user: process.env['SMTP_USER'],
      pass: process.env['SMTP_PASS'],
    },
  });
}

function buildOrderEmailHtml(data: OrderEmailData): string {
  const shopName = process.env['SHOP_NAME'] ?? 'Stationery Shop';
  const itemRows = data.items
    .map(
      (item, i) => `
      <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}">
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${item.productName}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">${item.sku}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">₹${item.unitPrice.toFixed(2)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">₹${item.totalPrice.toFixed(2)}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Order — ${data.orderNumber}</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#f1f5f9;">
  <div style="max-width:700px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">${shopName}</h1>
      <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">📦 New Order Received</p>
    </div>

    <!-- Order Info Bar -->
    <div style="background:#eff6ff;padding:16px 32px;display:flex;gap:24px;border-bottom:1px solid #dbeafe;">
      <div><span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Order Number</span><br>
        <strong style="color:#1e3a8a;font-size:16px;">${data.orderNumber}</strong></div>
      <div><span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Order Date</span><br>
        <strong style="color:#1e3a8a;">${data.orderDate}</strong></div>
      ${data.preferredDeliveryDate ? `<div><span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Preferred Delivery</span><br><strong style="color:#1e3a8a;">${data.preferredDeliveryDate}</strong></div>` : ''}
    </div>

    <!-- Customer Info -->
    <div style="padding:24px 32px;">
      <h2 style="margin:0 0 16px;font-size:16px;color:#374151;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Customer Details</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#64748b;width:140px;">Name</td><td style="padding:4px 0;font-weight:600;color:#1e293b;">${data.customerName}</td></tr>
        <tr><td style="padding:4px 0;color:#64748b;">Company</td><td style="padding:4px 0;font-weight:600;color:#1e293b;">${data.companyName}</td></tr>
        ${data.gstNumber ? `<tr><td style="padding:4px 0;color:#64748b;">GST Number</td><td style="padding:4px 0;color:#1e293b;">${data.gstNumber}</td></tr>` : ''}
        <tr><td style="padding:4px 0;color:#64748b;">Phone</td><td style="padding:4px 0;color:#1e293b;">${data.phone}</td></tr>
        <tr><td style="padding:4px 0;color:#64748b;">Email</td><td style="padding:4px 0;color:#1e293b;">${data.email}</td></tr>
        <tr><td style="padding:4px 0;color:#64748b;">Address</td><td style="padding:4px 0;color:#1e293b;">${data.address}</td></tr>
      </table>
    </div>

    <!-- Order Items -->
    <div style="padding:0 32px 24px;">
      <h2 style="margin:0 0 16px;font-size:16px;color:#374151;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Order Items</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Product</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">SKU</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Rate</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totals -->
      <div style="margin-top:16px;text-align:right;">
        <table style="margin-left:auto;">
          <tr><td style="padding:4px 16px;color:#64748b;text-align:right;">Subtotal:</td><td style="padding:4px 0;text-align:right;">₹${data.subtotal.toFixed(2)}</td></tr>
          <tr><td colspan="2"><hr style="border:none;border-top:2px solid #1e3a8a;margin:8px 0;"></td></tr>
          <tr><td style="padding:4px 16px;font-weight:700;color:#1e3a8a;font-size:18px;text-align:right;">Grand Total:</td>
              <td style="padding:4px 0;font-weight:700;color:#1e3a8a;font-size:18px;text-align:right;">₹${data.grandTotal.toFixed(2)}</td></tr>
        </table>
      </div>
    </div>

    ${data.specialInstructions ? `
    <div style="margin:0 32px 24px;background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:16px;">
      <strong style="color:#854d0e;">📝 Special Instructions:</strong>
      <p style="margin:8px 0 0;color:#713f12;">${data.specialInstructions}</p>
    </div>` : ''}

    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0;font-size:13px;color:#64748b;">This is an automated notification from your <strong>${shopName}</strong> Order Management System.</p>
      <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">Please log in to the admin dashboard to process this order.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  const shopOwnerEmail = process.env['SHOP_OWNER_EMAIL'];
  if (!shopOwnerEmail || !process.env['SMTP_USER']) {
    logger.warn('Email not configured — skipping order email notification');
    return;
  }

  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: `"${process.env['SHOP_NAME'] ?? 'Stationery OMS'}" <${process.env['SMTP_USER']}>`,
      to: shopOwnerEmail,
      subject: `🛒 New Order ${data.orderNumber} — ${data.companyName}`,
      html: buildOrderEmailHtml(data),
    });
    logger.info(`✅ Order email sent for ${data.orderNumber} to ${shopOwnerEmail}`);
  } catch (error) {
    logger.error('❌ Failed to send order email:', error);
    // Don't throw — email failure should not break the order creation
  }
}

export async function sendPasswordResetEmail(email: string, name: string, otp: string): Promise<void> {
  const shopName = process.env['SHOP_NAME'] ?? 'Stationery OMS';
  
  // Always log OTP to server console in dev or emergency recovery mode so admin can recover even without SMTP
  logger.info(`🔑 [DEV/EMERGENCY RECOVERY] Password Reset OTP for ${email}: ${otp}`);

  if (!process.env['SMTP_USER'] || !process.env['SMTP_PASS']) {
    logger.warn(`SMTP not configured — printed OTP (${otp}) to server console.`);
    return;
  }

  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Password Reset OTP</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#f1f5f9;">
  <div style="max-width:550px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);text-align:center;">
    <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:32px;color:#ffffff;">
      <h1 style="margin:0;font-size:24px;font-weight:700;">${shopName}</h1>
      <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">🔒 Password Recovery Request</p>
    </div>
    <div style="padding:32px 24px;color:#334155;">
      <p style="font-size:16px;margin:0 0 16px;">Hello <strong>${name}</strong>,</p>
      <p style="font-size:14px;color:#64748b;margin:0 0 24px;">You requested to reset your admin portal password. Use the verification code below to set a new password. This code expires in 15 minutes.</p>
      
      <div style="background:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;padding:20px;margin:0 auto 24px;max-width:260px;">
        <span style="font-size:28px;font-weight:800;letter-spacing:6px;color:#1e3a8a;">${otp}</span>
      </div>

      <p style="font-size:12px;color:#94a3b8;margin:0;">If you did not request this, please ignore this email or check your admin account security.</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"${shopName} Security" <${process.env['SMTP_USER']}>`,
      to: email,
      subject: `🔒 Your Password Reset Verification Code: ${otp}`,
      html,
    });
    logger.info(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    logger.error('❌ Failed to send password reset email:', error);
  }
}

