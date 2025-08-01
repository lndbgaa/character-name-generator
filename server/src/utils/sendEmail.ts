import config from "@/config/app.config.js";
import transporter from "@/config/nodemailer.config.js";

const { user } = config.gmail;

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await transporter.sendMail({
    from: user,
    to,
    subject,
    html,
  });
}

export default sendEmail;
