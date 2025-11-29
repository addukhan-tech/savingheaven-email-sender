import nodemailer from "nodemailer";

const SENDERS = [
  {
    email: "team@marketing.savingheaven.com",
    pass: process.env.SMTP_PASS_1,
    host: "smtp.hostinger.com",
    port: 587,
  },
  {
    email: "sales@savingheaven.com",
    pass: process.env.SMTP_PASS_2,
    host: "smtp.hostinger.com",
    port: 587,
  },
  {
    email: "sales@offers.savingheaven.com",
    pass: process.env.SMTP_PASS_3,
    host: "smtp.hostinger.com",
    port: 587,
  },
  {
    email: "olivia@offers.savingheaven.com",
    pass: process.env.SMTP_PASS_4,
    host: "smtp.hostinger.com",
    port: 587,
  },
  {
    email: "ella@offers.savingheaven.com",
    pass: process.env.SMTP_PASS_5,
    host: "smtp.hostinger.com",
    port: 587,
  },
  {
    email: "sophia@offers.savingheaven.com",
    pass: process.env.SMTP_PASS_6,
    host: "smtp.hostinger.com",
    port: 587,
  }
];

// 🔥 ROUND ROBIN INDEX
let currentIndex = 0;

function getNextSender() {
  const sender = SENDERS[currentIndex];

  // Move to next index
  currentIndex++;

  // If index reaches 6 → reset to 0
  if (currentIndex >= SENDERS.length) {
    currentIndex = 0;
  }

  return sender;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // 🔥 pick next sender in rotation
  const sender = getNextSender();

  const transporter = nodemailer.createTransport({
    host: sender.host,
    port: sender.port,
    auth: {
      user: sender.email,
      pass: sender.pass
    }
  });

  try {
    await transporter.sendMail({
      from: sender.email,
      to,
      subject,
      html,
    });

    return res.status(200).json({
      message: "Email sent",
      using: sender.email
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
