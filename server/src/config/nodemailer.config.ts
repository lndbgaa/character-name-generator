import nodemailer from "nodemailer";

import config from "@/config/app.config.js";

const { user, pass } = config.gmail;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass,
  },
});

export default transporter;
