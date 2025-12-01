// Quick email test script
import { sendEmail } from './src/services/email/emailService';

async function testEmail() {
    try {
        await sendEmail({
            to: 'test@example.com', // Replace with your email
            subject: 'Test Email from Property Management',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">🎉 Email Configuration Successful!</h2>
          <p>Your property management system can now send emails.</p>
          <p>This is a test email to confirm everything is working correctly.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Sent from Property Management System
          </p>
        </div>
      `
        });
        console.log('✅ Test email sent successfully!');
    } catch (error) {
        console.error('❌ Failed to send test email:', error);
    }
}

testEmail();
