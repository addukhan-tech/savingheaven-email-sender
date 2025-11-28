import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, html } = req.body;

  if (!to) return res.status(400).json({ error: "Recipient missing" });

  // Load send log
  const logPath = path.join(process.cwd(), "send-log.json");
  let log = JSON.parse(fs.readFileSync(logPath, "utf8"));

  // Reset counts daily
  const today = new Date().toISOString().slice(0, 10);
  if (log.date !== today) {
    for (const key in log) {
      if (key !== "date") log[key] = 0;
    }
    log.date = today;
  }

  // SMTP accounts (you will add passwords here)
  const accounts = [
    {
      email: "team@marketing.savingheaven.com",
      pass: process.env.PASS1,
    },
    {
      email: "sales@savingheaven.com",
      pass: process.env.PASS2,
    },
    {
      email: "sales@offers.savingheaven.com",
      pass: process.env.PASS3,
    },
    {
      email: "olivia@offers.savingheaven.com",
      pass: process.env.PASS4,
    },
    {
      email: "ella@offers.savingheaven.com",
      pass: process.env.PASS5,
    },
    {
      email: "sophia@offers.savingheaven.com",
      pass: process.env.PASS6,
    },
  ];

  // Find first sender with less than 15 emails today
  const sender = accounts.find(acc => log[acc.email] < 15);

  if (!sender) {
    return res.status(429).json({ error: "Daily email limit reached" });
  }

  // Nodemailer SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 587,
    secure: false,
    auth: {
      user: sender.email,
      pass: sender.pass,
    },
  });

  try {
    await transporter.sendMail({
      from: sender.email,
      to,
      subject,
      html,
    });

    // Increase counter
    log[sender.email] += 1;

    // Save log
    fs.writeFileSync(logPath, JSON.stringify(log, null, 2));

    return res.json({
      message: "Email sent",
      using: sender.email,
      sentToday: log[sender.email],
    });
  } catch (e) {
    return res.status(500).json({ error: e.toString() });
  }
}
