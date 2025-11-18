// api/send-email.js
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  FROM_NAME,
  FROM_EMAIL,
  SHARED_SECRET
} = process.env;

const BANNER_IMAGE_URL =
  "https://drive.google.com/uc?export=view&id=1luStqxU2Qiyz_Tj81HAHsCZeJrIosCxb";

function htmlTemplate() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { margin:0; padding:0; font-family: Arial, sans-serif; background:#111; color:#fff; }
    .wrap { max-width:640px; margin:0 auto; }
    .banner img { width:100%; display:block; }
    .content { padding:25px; background:#000000aa; }
    h1 { font-size:32px; }
    .red { color:#e50914; }
    a.cta { background:#e50914; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; display:inline-block; margin-top:12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="banner">
      <img src="cid:banner" alt="Black Friday Banner" />
    </div>
    <div class="content">
      <h1><span class="red">BLACK</span> FRIDAY</h1>
      <p><b>Black Friday:</b> 20% Off Our Signature Luxury Boards</p>
      <p>Handcrafted from premium woods, finished to perfection, and ready to impress.</p>
      <p>The perfect gift for your loved ones — elegant, timeless, and built to last.</p>

      <p style="text-align:center;">
        <a class="cta" href="https://savingheaven.com/collections/black-friday">Shop 20% OFF Today</a>
      </p>

      <p><b>Order from Website:</b><br>
      <a href="https://savingheaven.com/" style="color:#8ecbff;">savingheaven.com</a></p>

      <p><b>Amazon:</b><br>
      <a href="https://www.amazon.com/stores/SAVINGHEAVENLLC/page/6BFA71E1-7D3E-4912-928D-E732A5889A51" style="color:#8ecbff;">Amazon Store</a></p>

      <p>Stay connected: Instagram | Facebook | TikTok</p>
      <p><b>P.S.</b> Offer ends at midnight.</p>
    </div>
  </div>
</body>
</html>`;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { secret, email } = req.body;

    if (!secret || secret !== SHARED_SECRET) {
      return res.status(401).json({ error: "Invalid secret" });
    }
    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    // Load the banner image
    const imgRes = await fetch(BANNER_IMAGE_URL);
    const imgBuffer = await imgRes.buffer();

    // SMTP transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      tls: { rejectUnauthorized: false }
    });

    const mailOptions = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: "The Perfect Gift 20% Off Today Only",
      html: htmlTemplate(),
      attachments: [
        {
          filename: "banner.jpg",
          content: imgBuffer,
          cid: "banner"
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.toString() });
  }
};
