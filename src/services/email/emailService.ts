import { createTransport } from 'nodemailer';
import { logger } from '../../utils/logger';

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Create reusable transporter
const transporter = createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: EMAIL_USER && EMAIL_PASS ? {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  } : undefined,
});

// Verify connection configuration
if (EMAIL_USER && EMAIL_PASS) {
  transporter.verify((error: any, success: any) => {
    if (error) {
      logger.error({ error }, 'Email service configuration error');
    } else {
      logger.info('Email service is ready to send messages');
    }
  });
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!EMAIL_USER || !EMAIL_PASS) {
    logger.warn({ to: options.to, subject: options.subject }, 'Email service not configured');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    logger.info('Email sent successfully:', info.messageId);
  } catch (error) {
    logger.error({ error }, 'Failed to send email');
    throw new Error('Failed to send email');
  }
}

export async function sendLeaseAgreementEmail(
  to: string,
  tenantName: string,
  propertyAddress: string,
  agreementId: string,
  expiresAt: Date
): Promise<void> {
  const signingLink = `${APP_URL}/sign-agreement/${agreementId}`;
  const expiryDate = expiresAt.toLocaleDateString();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 Lease Agreement Ready for Signature</h1>
        </div>
        <div class="content">
          <p>Hello ${tenantName},</p>
          
          <p>Your lease agreement for <strong>${propertyAddress}</strong> is ready for your review and signature.</p>
          
          <div class="info-box">
            <p><strong>⏰ Important:</strong> This signing link will expire on <strong>${expiryDate}</strong></p>
          </div>
          
          <p>To review and sign your lease agreement:</p>
          <ol>
            <li>Click the button below to access the agreement</li>
            <li>Review all terms carefully</li>
            <li>Sign electronically using your typed or drawn signature</li>
          </ol>
          
          <center>
            <a href="${signingLink}" class="button">Review & Sign Agreement</a>
          </center>
          
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            Or copy this link: <a href="${signingLink}">${signingLink}</a>
          </p>
          
          <p>If you have any questions about the lease agreement, please contact us.</p>
          
          <p>Best regards,<br>Property Management Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Lease Agreement Ready for Signature
    
    Hello ${tenantName},
    
    Your lease agreement for ${propertyAddress} is ready for your review and signature.
    
    This signing link will expire on ${expiryDate}.
    
    To review and sign your lease agreement, visit:
    ${signingLink}
    
    If you have any questions about the lease agreement, please contact us.
    
    Best regards,
    Property Management Team
  `;

  await sendEmail({
    to,
    subject: '📝 Your Lease Agreement is Ready for Signature',
    html,
    text,
  });
}

export async function sendTenantInvitationEmail(
  to: string,
  tenantName: string,
  token: string,
  expiresAt: Date
): Promise<void> {
  const invitationLink = `${APP_URL}/tenant-portal/setup/${token}`;
  const expiryDate = expiresAt.toLocaleDateString();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Welcome to Your Tenant Portal</h1>
        </div>
        <div class="content">
          <p>Hello ${tenantName},</p>
          
          <p>Welcome! You've been invited to access your tenant portal where you can:</p>
          
          <ul>
            <li>View your lease details</li>
            <li>Make rent payments</li>
            <li>Submit maintenance requests</li>
            <li>Access important documents</li>
            <li>Communicate with property management</li>
          </ul>
          
          <div class="info-box">
            <p><strong>⏰ Important:</strong> This invitation link will expire on <strong>${expiryDate}</strong></p>
          </div>
          
          <p>To set up your account:</p>
          <ol>
            <li>Click the button below</li>
            <li>Create a secure password</li>
            <li>Start using your tenant portal</li>
          </ol>
          
          <center>
            <a href="${invitationLink}" class="button">Set Up My Account</a>
          </center>
          
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            Or copy this link: <a href="${invitationLink}">${invitationLink}</a>
          </p>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>Property Management Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to Your Tenant Portal
    
    Hello ${tenantName},
    
    You've been invited to access your tenant portal where you can view lease details, make payments, submit maintenance requests, and more.
    
    This invitation link will expire on ${expiryDate}.
    
    To set up your account, visit:
    ${invitationLink}
    
    If you have any questions, please don't hesitate to contact us.
    
    Best regards,
    Property Management Team
  `;

  await sendEmail({
    to,
    subject: '🏠 Welcome to Your Tenant Portal - Set Up Your Account',
    html,
    text,
  });
}

export async function sendAgreementSignedNotification(
  to: string,
  tenantName: string,
  propertyAddress: string,
  agreementId: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">✅</div>
          <h1>Lease Agreement Signed</h1>
        </div>
        <div class="content">
          <p>Great news!</p>
          
          <p>The lease agreement for <strong>${propertyAddress}</strong> has been successfully signed by <strong>${tenantName}</strong>.</p>
          
          <div class="info-box">
            <p><strong>Agreement ID:</strong> ${agreementId}</p>
            <p><strong>Signed at:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>The signed document is now available in your dashboard for download.</p>
          
          <p>Best regards,<br>Property Management System</p>
        </div>
        <div class="footer">
          <p>This is an automated notification.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Lease Agreement Signed
    
    Great news! The lease agreement for ${propertyAddress} has been successfully signed by ${tenantName}.
    
    Agreement ID: ${agreementId}
    Signed at: ${new Date().toLocaleString()}
    
    The signed document is now available in your dashboard for download.
    
    Best regards,
    Property Management System
  `;

  await sendEmail({
    to,
    subject: '✅ Lease Agreement Signed Successfully',
    html,
    text,
  });
}

export async function sendPaymentReceiptEmail(
  to: string,
  tenantName: string,
  amount: number,
  receiptNumber: string,
  pdfBuffer: Buffer
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">💰</div>
          <h1>Payment Received</h1>
        </div>
        <div class="content">
          <p>Hello ${tenantName},</p>
          
          <p>We have successfully received your payment of <strong>$${amount.toFixed(2)}</strong>.</p>
          
          <div class="info-box">
            <p><strong>Receipt #:</strong> ${receiptNumber}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Please find your official receipt attached to this email.</p>
          
          <p>Best regards,<br>Property Management Team</p>
        </div>
        <div class="footer">
          <p>This is an automated notification.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Payment Received
    
    Hello ${tenantName},
    
    We have successfully received your payment of $${amount.toFixed(2)}.
    
    Receipt #: ${receiptNumber}
    Date: ${new Date().toLocaleDateString()}
    
    Please find your official receipt attached to this email.
    
    Best regards,
    Property Management Team
  `;

  if (!EMAIL_USER || !EMAIL_PASS) {
    logger.warn({ to, subject: 'Payment Receipt' }, 'Email service not configured');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject: `Payment Receipt - ${receiptNumber}`,
      html,
      text,
      attachments: [
        {
          filename: `receipt-${receiptNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    logger.info('Receipt email sent successfully:', info.messageId);
  } catch (error) {
    logger.error({ error }, 'Failed to send receipt email');
    // Don't throw here to avoid failing the payment process if email fails
  }
}
