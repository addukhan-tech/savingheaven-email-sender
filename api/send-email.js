import nodemailer from "nodemailer";

// ⭐ PASTE EMAIL_TEMPLATE HERE
const EMAIL_TEMPLATE = `
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#000000; margin:0; padding:0; font-family:Arial, sans-serif;">
  <tr>
    <td align="center">

      <!-- Full image -->
      <img src="cid:entiretemplate"
           alt="Black Friday Offer"
           width="640"
           style="display:block; width:100%; max-width:640px; border:none;">

      <!-- Shop Now Button -->
      <table width="100%" style="max-width:640px; margin-top:20px; text-align:center;">
        <tr>
          <td align="center">
            <a href="https://savingheaven.com/"
               style="background-color:#D32F2F; color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-size:18px; font-weight:bold; display:inline-block;">
              Shop Now 20% OFF Today Only
            </a>
          </td>
        </tr>
      </table>

      <p style="color:#ffffff; font-size:14px; margin-top:20px;">
        <b>Order from our Website:</b><br>
        <a href="https://savingheaven.com/" style="color:#4A89F3; text-decoration:underline;">
          https://savingheaven.com/
        </a>
      </p>

      <p style="color:#ffffff; font-size:14px; margin-top:10px;">
        <b>Or find us on Amazon:</b><br>
        <a href="https://www.amazon.com/stores/SAVINGHEAVENLLC/page/6BFA71E1-7D3E-4912-928D-E732A5889A51"
           style="color:#4A89F3; text-decoration:underline;">
          Visit Amazon Store
        </a>
      </p>

      <p style="color:#ffffff; font-size:14px; margin-top:25px; margin-bottom:5px;">
        Stay connected and inspired:
      </p>

      <p style="color:#ffffff; font-size:14px;">
        <a href="https://www.instagram.com/savingheavenll/?utm_source=ig_web_button_share_sheet"
           style="color:white; text-decoration:underline;">Instagram</a>
        |
        <a href="https://www.facebook.com/share/1WBLfDXUx4/"
           style="color:white; text-decoration:underline;">Facebook</a>
        |
        <a href="https://youtube.com/@savingheaven-e7l?si=NhrJL7uNeTaRuDNZ"
           style="color:white; text-decoration:underline;">YouTube</a>
        |
        <a href="https://www.tiktok.com/@savingheaven"
           style="color:white; text-decoration:underline;">TikTok</a>
      </p>

      <p style="color:#aaaaaa; font-size:12px; margin-top:10px;">
        <b>P.S.</b> Offer ends at midnight. Don't miss your chance to gift something unforgettable.
      </p>

    </td>
  </tr>
</table>
`;

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
  html: EMAIL_TEMPLATE,
  attachments: [
    {
      filename: "template-image.png",
      path: "https://drive.google.com/uc?export=view&id=1luStqxU2Qiyz_Tj81HAHsCZeJrIosCxb",
      cid: "entiretemplate"
    }
  ]
});


    return res.status(200).json({
      message: "Email sent",
      using: sender.email
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
