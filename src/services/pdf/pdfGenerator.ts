import puppeteer from 'puppeteer';
import { logger } from '../../utils/logger';
import type { Lease, Tenant, Unit, Property } from '@prisma/client';

interface LeaseWithRelations extends Lease {
  tenant: Tenant;
  unit: Unit & {
    property: Property;
  };
}

interface LeaseSignature {
  id: string;
  agreementId: string;
  signerType: 'LANDLORD' | 'TENANT';
  signerName: string;
  signerEmail: string;
  signatureData: string | null;
  signatureMethod: 'TYPED' | 'DRAWN';
  ipAddress: string | null;
  signedAt: Date | null;
  createdAt: Date;
}

interface GeneratePDFOptions {
  lease: LeaseWithRelations;
  signatures?: LeaseSignature[];
  agreementContent?: string;
}

export async function generateLeaseAgreementPDF(options: GeneratePDFOptions): Promise<Buffer> {
  const { lease, signatures = [], agreementContent } = options;

  const html = agreementContent || generateDefaultLeaseTemplate(lease, signatures);

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    await browser.close();

    logger.info({ leaseId: lease.id }, 'PDF generated successfully for lease');
    return Buffer.from(pdfBuffer);
  } catch (error) {
    logger.error({ error }, 'Failed to generate PDF');
    throw new Error('Failed to generate lease agreement PDF');
  }
}

function generateDefaultLeaseTemplate(
  lease: LeaseWithRelations,
  signatures: LeaseSignature[]
): string {
  const landlordSignature = signatures.find(s => s.signerType === 'LANDLORD');
  const tenantSignature = signatures.find(s => s.signerType === 'TENANT');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Residential Lease Agreement</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
    }

    .container {
      max-width: 100%;
      padding: 0;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 2px solid #000;
    }

    .header h1 {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    .section {
      margin-bottom: 25px;
    }

    .section-title {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 10px;
      text-decoration: underline;
    }

    .clause {
      margin-bottom: 15px;
      text-align: justify;
    }

    .clause-number {
      font-weight: bold;
      margin-right: 5px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 8px;
      margin: 15px 0;
    }

    .info-label {
      font-weight: bold;
    }

    .info-value {
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
    }

    .signature-section {
      margin-top: 50px;
      page-break-inside: avoid;
    }

    .signature-block {
      margin-top: 40px;
      page-break-inside: avoid;
    }

    .signature-line {
      border-top: 1px solid #000;
      width: 300px;
      margin-top: 50px;
      padding-top: 5px;
    }

    .signature-image {
      max-width: 250px;
      max-height: 80px;
      margin-bottom: 5px;
    }

    .signature-info {
      font-size: 10pt;
      color: #666;
      margin-top: 5px;
    }

    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #000;
      font-size: 10pt;
      text-align: center;
      color: #666;
    }

    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Residential Lease Agreement</h1>
      <p>This agreement is entered into on ${formatDate(new Date())}</p>
    </div>

    <!-- Parties Section -->
    <div class="section">
      <div class="section-title">1. PARTIES</div>
      <div class="clause">
        This Lease Agreement ("Agreement") is made between:
      </div>
      <div class="info-grid">
        <div class="info-label">Landlord:</div>
        <div class="info-value">Property Management</div>
        <div class="info-label">Tenant:</div>
        <div class="info-value">${lease.tenant.name}</div>
        <div class="info-label">Email:</div>
        <div class="info-value">${lease.tenant.email || 'N/A'}</div>
        <div class="info-label">Phone:</div>
        <div class="info-value">${lease.tenant.phone || 'N/A'}</div>
      </div>
    </div>

    <!-- Property Section -->
    <div class="section">
      <div class="section-title">2. PROPERTY</div>
      <div class="clause">
        The Landlord agrees to lease to the Tenant the following property:
      </div>
      <div class="info-grid">
        <div class="info-label">Address:</div>
        <div class="info-value">${lease.unit.property.address}</div>
        <div class="info-label">Unit Number:</div>
        <div class="info-value">${lease.unit.unitNumber}</div>
        ${lease.unit.sizeSqft ? `
        <div class="info-label">Size:</div>
        <div class="info-value">${lease.unit.sizeSqft} sq ft</div>
        ` : ''}
      </div>
    </div>

    <!-- Term Section -->
    <div class="section">
      <div class="section-title">3. TERM</div>
      <div class="clause">
        <span class="clause-number">3.1</span>
        The term of this Lease shall commence on <strong>${formatDate(lease.startDate)}</strong> 
        and shall continue until <strong>${formatDate(lease.endDate)}</strong>.
      </div>
      <div class="clause">
        <span class="clause-number">3.2</span>
        Upon expiration of the initial term, this Lease may be renewed upon mutual agreement 
        of both parties in writing.
      </div>
    </div>

    <!-- Rent Section -->
    <div class="section">
      <div class="section-title">4. RENT</div>
      <div class="clause">
        <span class="clause-number">4.1</span>
        The Tenant agrees to pay rent in the amount of <strong>${formatCurrency(lease.rentAmount)}</strong> 
        per month.
      </div>
      <div class="clause">
        <span class="clause-number">4.2</span>
        Rent is due on the first day of each month and shall be considered late if not received 
        by the fifth day of the month.
      </div>
      <div class="clause">
        <span class="clause-number">4.3</span>
        Payment shall be made by check, electronic transfer, or other method as agreed upon 
        by the parties.
      </div>
    </div>

    <!-- Security Deposit Section -->
    ${lease.securityDeposit ? `
    <div class="section">
      <div class="section-title">5. SECURITY DEPOSIT</div>
      <div class="clause">
        <span class="clause-number">5.1</span>
        The Tenant has paid a security deposit of <strong>${formatCurrency(lease.securityDeposit)}</strong> 
        to the Landlord.
      </div>
      <div class="clause">
        <span class="clause-number">5.2</span>
        The security deposit shall be held by the Landlord and may be used to cover any damages 
        to the property beyond normal wear and tear, unpaid rent, or other breaches of this Agreement.
      </div>
      <div class="clause">
        <span class="clause-number">5.3</span>
        The security deposit, less any lawful deductions, shall be returned to the Tenant within 
        thirty (30) days after the termination of this Lease.
      </div>
    </div>
    ` : ''}

    <!-- Utilities Section -->
    <div class="section">
      <div class="section-title">${lease.securityDeposit ? '6' : '5'}. UTILITIES</div>
      <div class="clause">
        <span class="clause-number">${lease.securityDeposit ? '6.1' : '5.1'}</span>
        The Tenant shall be responsible for payment of all utilities and services, including but 
        not limited to electricity, gas, water, sewer, telephone, internet, and cable television.
      </div>
    </div>

    <!-- Maintenance Section -->
    <div class="section">
      <div class="section-title">${lease.securityDeposit ? '7' : '6'}. MAINTENANCE AND REPAIRS</div>
      <div class="clause">
        <span class="clause-number">${lease.securityDeposit ? '7.1' : '6.1'}</span>
        The Landlord shall maintain the property in good repair and shall make all necessary repairs 
        to keep the property habitable.
      </div>
      <div class="clause">
        <span class="clause-number">${lease.securityDeposit ? '7.2' : '6.2'}</span>
        The Tenant shall maintain the property in a clean and sanitary condition and shall be 
        responsible for any damage caused by the Tenant's negligence or misuse.
      </div>
    </div>

    <!-- Use of Premises Section -->
    <div class="section">
      <div class="section-title">${lease.securityDeposit ? '8' : '7'}. USE OF PREMISES</div>
      <div class="clause">
        <span class="clause-number">${lease.securityDeposit ? '8.1' : '7.1'}</span>
        The property shall be used solely as a private residence for the Tenant and their immediate family.
      </div>
      <div class="clause">
        <span class="clause-number">${lease.securityDeposit ? '8.2' : '7.2'}</span>
        The Tenant shall not use the property for any illegal purpose or in any manner that would 
        disturb the peace and quiet of other residents.
      </div>
    </div>

    <!-- Termination Section -->
    <div class="section">
      <div class="section-title">${lease.securityDeposit ? '9' : '8'}. TERMINATION</div>
      <div class="clause">
        <span class="clause-number">${lease.securityDeposit ? '9.1' : '8.1'}</span>
        Either party may terminate this Lease upon thirty (30) days written notice to the other party.
      </div>
      <div class="clause">
        <span class="clause-number">${lease.securityDeposit ? '9.2' : '8.2'}</span>
        The Landlord may terminate this Lease immediately upon material breach by the Tenant, 
        including but not limited to non-payment of rent or violation of any terms of this Agreement.
      </div>
    </div>

    <!-- Signatures Section -->
    <div class="signature-section">
      <div class="section-title">SIGNATURES</div>
      <p style="margin-bottom: 30px;">
        By signing below, both parties acknowledge that they have read, understood, and agree 
        to be bound by all terms and conditions of this Lease Agreement.
      </p>

      <!-- Landlord Signature -->
      <div class="signature-block">
        <strong>LANDLORD:</strong>
        ${landlordSignature ? `
          ${landlordSignature.signatureData && landlordSignature.signatureMethod === 'DRAWN' ? `
            <div>
              <img src="${landlordSignature.signatureData}" alt="Landlord Signature" class="signature-image" />
            </div>
          ` : `
            <div class="signature-line">
              <em>${landlordSignature.signerName}</em>
            </div>
          `}
          <div class="signature-info">
            Signed on: ${formatDate(landlordSignature.signedAt || new Date())}<br>
            IP Address: ${landlordSignature.ipAddress || 'N/A'}
          </div>
        ` : `
          <div class="signature-line">
            _________________________________
          </div>
          <div style="margin-top: 5px;">Signature</div>
        `}
      </div>

      <!-- Tenant Signature -->
      <div class="signature-block">
        <strong>TENANT:</strong>
        ${tenantSignature ? `
          ${tenantSignature.signatureData && tenantSignature.signatureMethod === 'DRAWN' ? `
            <div>
              <img src="${tenantSignature.signatureData}" alt="Tenant Signature" class="signature-image" />
            </div>
          ` : `
            <div class="signature-line">
              <em>${tenantSignature.signerName}</em>
            </div>
          `}
          <div class="signature-info">
            Signed on: ${formatDate(tenantSignature.signedAt || new Date())}<br>
            IP Address: ${tenantSignature.ipAddress || 'N/A'}
          </div>
        ` : `
          <div class="signature-line">
            _________________________________
          </div>
          <div style="margin-top: 5px;">Signature</div>
          <div style="margin-top: 10px;">Name: ${lease.tenant.name}</div>
        `}
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>This document was electronically generated and signed.</p>
      <p>Agreement ID: ${lease.id}</p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function saveLeaseAgreementPDF(
  lease: LeaseWithRelations,
  signatures: LeaseSignature[],
  filePath: string
): Promise<void> {
  const pdfBuffer = await generateLeaseAgreementPDF({ lease, signatures });
  const fs = await import('fs/promises');
  await fs.writeFile(filePath, pdfBuffer);
  logger.info(`PDF saved to: ${filePath}`);
}

interface PaymentWithRelations {
  id: string;
  amount: number;
  dueDate: Date;
  paidAt: Date | null;
  status: string;
  receiptNumber: string | null;
  paymentMethod: string | null;
  lease: {
    tenant: {
      name: string;
      email: string;
    };
    unit: {
      unitNumber: string;
      property: {
        name: string;
        address: string;
      };
    };
  };
}

export async function generatePaymentReceiptPDF(payment: PaymentWithRelations): Promise<Buffer> {
  const html = generateReceiptTemplate(payment);

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    await browser.close();

    logger.info({ paymentId: payment.id }, 'Receipt PDF generated successfully');
    return Buffer.from(pdfBuffer);
  } catch (error) {
    logger.error({ error }, 'Failed to generate receipt PDF');
    throw new Error('Failed to generate receipt PDF');
  }
}

function generateReceiptTemplate(payment: PaymentWithRelations): string {
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt</title>
  <style>
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      border: 1px solid #eee;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 20px;
    }
    .company-info h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 24px;
    }
    .receipt-title {
      text-align: right;
    }
    .receipt-title h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 32px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .receipt-details {
      margin-top: 10px;
      font-size: 14px;
      color: #666;
    }
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .info-block h3 {
      font-size: 14px;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 10px;
    }
    .info-block p {
      margin: 0;
      font-weight: 500;
    }
    .payment-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }
    .payment-table th {
      text-align: left;
      padding: 15px;
      background-color: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
      color: #495057;
    }
    .payment-table td {
      padding: 15px;
      border-bottom: 1px solid #dee2e6;
    }
    .total-section {
      text-align: right;
      margin-bottom: 40px;
    }
    .total-label {
      font-size: 16px;
      font-weight: bold;
      color: #666;
      margin-right: 20px;
    }
    .total-amount {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
    }
    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #888;
      font-size: 12px;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      background-color: #d4edda;
      color: #155724;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-info">
        <h1>Property Management</h1>
        <p>123 Real Estate Ave<br>Business City, ST 12345</p>
      </div>
      <div class="receipt-title">
        <h2>Receipt</h2>
        <div class="receipt-details">
          <p>Receipt #: ${payment.receiptNumber || 'PENDING'}</p>
          <p>Date: ${formatDate(payment.paidAt)}</p>
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="info-block">
        <h3>Bill To</h3>
        <p>${payment.lease.tenant.name}</p>
        <p>${payment.lease.tenant.email}</p>
      </div>
      <div class="info-block">
        <h3>Property Details</h3>
        <p>${payment.lease.unit.property.name}</p>
        <p>${payment.lease.unit.property.address}</p>
        <p>Unit ${payment.lease.unit.unitNumber}</p>
      </div>
    </div>

    <table class="payment-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Payment Method</th>
          <th>Status</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Rent Payment - Due ${formatDate(payment.dueDate)}</td>
          <td>${payment.paymentMethod || 'N/A'}</td>
          <td><span class="status-badge">${payment.status}</span></td>
          <td style="text-align: right;">${formatCurrency(payment.amount)}</td>
        </tr>
      </tbody>
    </table>

    <div class="total-section">
      <span class="total-label">Total Paid:</span>
      <span class="total-amount">${formatCurrency(payment.amount)}</span>
    </div>

    <div class="footer">
      <p>Thank you for your payment.</p>
      <p>If you have any questions about this receipt, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
    `;
}
