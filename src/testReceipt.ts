import { generatePaymentReceiptPDF } from './services/pdf/pdfGenerator';
import fs from 'fs/promises';
import path from 'path';

async function testReceiptGeneration() {
    console.log('Starting receipt generation test...');

    const mockPayment = {
        id: 'test-payment-id',
        amount: 1500.00,
        dueDate: new Date(),
        paidAt: new Date(),
        status: 'PAID',
        receiptNumber: 'RCP-TEST-001',
        paymentMethod: 'CREDIT_CARD',
        lease: {
            tenant: {
                name: 'John Doe',
                email: 'john@example.com'
            },
            unit: {
                unitNumber: '101',
                property: {
                    name: 'Sunset Apartments',
                    address: '123 Sunset Blvd, Los Angeles, CA'
                }
            }
        }
    };

    try {
        const pdfBuffer = await generatePaymentReceiptPDF(mockPayment as any);
        const outputPath = path.join(process.cwd(), 'test-receipt.pdf');
        await fs.writeFile(outputPath, pdfBuffer);
        console.log(`✅ Success! Receipt generated at: ${outputPath}`);
    } catch (error) {
        console.error('❌ Failed to generate receipt:', error);
    }
}

testReceiptGeneration();
