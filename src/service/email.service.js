import nodemailer from "nodemailer";

/**
 * Create nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Email service for sending notifications via nodemailer
 */
const sendEmail = async (emailData) => {
  try {
    // If email credentials are not configured, log to console instead
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("\n📧 ============ EMAIL (MOCK) ============");
      console.log(`To: ${emailData.to}`);
      console.log(`Subject: ${emailData.subject}`);
      console.log(`Body:\n${emailData.body}`);
      console.log("========================================\n");
      console.warn("⚠️  EMAIL_USER and EMAIL_PASSWORD not configured.");
      return {
        success: true,
        messageId: `mock_${Date.now()}`,
        mode: "mock",
      };
    }

    const transporter = createTransporter();

    console.log(`📧 Sending email to ${emailData.to}...`);

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"FundooNotes" <noreply@fundoonotes.com>',
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.body,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">${emailData.subject}</h2>
        <div style="white-space: pre-wrap; line-height: 1.6;">
          ${emailData.body}
        </div>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #666; font-size: 12px;">
          Shared By: ${emailData.sharedBy}<br/>
          Timestamp: ${emailData.timestamp}
        </p>
      </div>`,
    });

    console.log(
      `✅ Email sent to ${emailData.to} - Message ID: ${info.messageId}`
    );

    return {
      success: true,
      messageId: info.messageId,
      mode: "real",
    };
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw error;
  }
};

export { sendEmail };
