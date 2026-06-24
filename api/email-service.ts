import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
});

interface ApplicationConfirmationData {
  name: string;
  email: string;
  position?: string;
}

export async function sendApplicationConfirmation(
  data: ApplicationConfirmationData
): Promise<void> {
  const { name, email, position = "Software Engineering Intern" } = data;

  // If email credentials are not configured, skip sending
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("[Email] Skipping confirmation email - credentials not configured");
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Job Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Application Received - ${position}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Application Received!</h1>
        </div>
        <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Thank you for applying for the <strong>${position}</strong> position.
            We have received your application and it is now under review.
          </p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6B7280;">
              <strong>What happens next?</strong>
            </p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #6B7280; font-size: 14px; line-height: 1.8;">
              <li>Our team will review your application</li>
              <li>You will be contacted within 5-7 business days</li>
              <li>Shortlisted candidates will be invited for an interview</li>
            </ul>
          </div>
          <p style="font-size: 14px; color: #6B7280;">
            If you have any questions, feel free to reply to this email.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
          <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Confirmation sent to ${email}`);
  } catch (error) {
    console.error("[Email] Failed to send confirmation:", error);
    // Don't throw - email failure shouldn't break the application flow
  }
}
