import nodemailer from "nodemailer";

// 🔥 Your sender accounts
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

// In-memory logs
let rotationLog = SENDERS.map(s => ({
  email: s.email,
  sentToday: 0
}));

// 🔥 Track last reset date
let lastResetDate = new Date().toDateString();

// 🔥 Reset if the day changed
function dailyResetCheck() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    rotationLog = SENDERS.map(s => ({
      email: s.email,
      sentToday: 0
    }));
    lastResetDate = today;
    console.log("🔥 Daily email counters reset!");
  }
}

// 🔥 Select sender (after reset check)
function getAvailableSender() {
  dailyResetCheck();

  for (let sender of rotationLog) {
    if (sender.sentToday < 15) {
      sender.sentToday++;
      return sender.email;
    }
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Select sender
  const selectedEmail = getAvailableSender();

  if (!selectedEmail) {
    return res.status(429).json({
      error: "All sender accounts reached 15 emails/day"
    });
  }

  const accountConfig = SENDERS.find(s => s.email === selectedEmail);

  const transporter = nodemailer.createTransport({
    host: accountConfig.host,
    port: accountConfig.port,
    auth: {
      user: accountConfig.email,
      pass: accountConfig.pass
    }
  });

  try {
    await transporter.sendMail({
      from: accountConfig.email,
      to,
      subject,
      html,
    });

    const log = rotationLog.find(s => s.email === selectedEmail);

    return res.status(200).json({
      message: "Email sent",
      using: selectedEmail,
      sentToday: log.sentToday
    });

  } catch (err) {
    console.log("Email Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
