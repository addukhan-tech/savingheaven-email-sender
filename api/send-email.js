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
    body {
      margin:0;
      padding:0;
      background:#000;
      color:#fff;
      font-family: Arial, sans-serif;
    }
    .wrap {
      max-width:640px;
      margin:0 auto;
      background:#000;
    }
    .banner img {
      width:100%;
      height:auto;
      display:block;
    }
    .section {
      padding:25px;
      text-align:center;
      background:#000;
      color:#fff;
    }
    a.cta {
      background:#e50914;
      padding:12px 22px;
      border-radius:6px;
      color:#fff;
      text-decoration:none;
      font-weight:bold;
      font-size:16px;
      display:inline-block;
      margin-bottom:20px;
    }
    a {
      color:#8ecbff;
      text-decoration:underline;
    }
    .footer {
      margin-top:20px;
      font-size:12px;
      color:#aaa;
    }
  </style>
</head>
<body>

  <div class="wrap">

    <!-- TOP IMAGE -->
    <div class="banner">
      <img src="cid:banner" alt="Black Friday Banner">
    </div>

    <!-- BUTTON + LINKS ONLY -->
    <div class="section">

      <!-- UPDATED BUTTON LINK -->
      <a class="cta" href="https://savingheaven.com/">
        Shop Now 20% OFF Today Only
      </a>

      <p><strong>Order from our Website:</strong><br>
        <a href="https://savingheaven.com/">https://savingheaven.com/</a>
      </p>

      <p><strong>Or find us on Amazon:</strong><br>
        <a href="https://www.amazon.com/stores/SAVINGHEAVENLLC/page/6BFA71E1-7D3E-4912-928D-E732A5889A51">
          Amazon Store Link
        </a>
      </p>

      <!-- UPDATED SOCIAL LINKS -->
      <p style="margin-top:22px;"><strong>Stay connected:</strong></p>

      <p style="margin-top:8px;">
        <a href="https://www.instagram.com/savingheavenll/?utm_source=ig_web_button_share_sheet">Instagram</a> |
        <a href="https://www.facebook.com/share/1WBLfDXUx4/">Facebook</a> |
        <a href="https://youtube.com/@savingheaven-e7l?si=NhrJL7uNeTaRuDNZ">YouTube</a> |
        <a href="https://www.tiktok.com/@savingheaven">TikTok</a>
      </p>

      <p class="footer">
        © Saving Heaven 2025. Offer ends at midnight.
      </p>

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
