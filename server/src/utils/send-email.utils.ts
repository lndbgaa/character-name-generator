import config from "@/config/app.config.js";
import transporter from "@/config/nodemailer.config.js";

const { user } = config.gmail;

/**
 * Sends an HTML email using the configured Nodemailer transporter.
 *
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject line.
 * @param {string} html - HTML content of the email.
 * @returns {Promise<void>}
 */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await transporter.sendMail({
    from: user,
    to,
    subject,
    html,
  });
}

export default sendEmail;
