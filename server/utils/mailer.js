const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Helper to format date as "1st May 2025"
const formatDateString = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${getOrdinal(day)} ${month} ${year}`;
};

// Helper to format duration with leading zero if single digit, e.g. "02"
const formatDuration = (months) => {
  if (!months) return '';
  const m = parseInt(months);
  return m < 10 ? `0${m}` : `${m}`;
};

// Helper to generate the common HTML template
const getHtmlContent = (studentName, formattedDate, formattedDuration) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #333333;
        line-height: 1.6;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 30px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background-color: #ffffff;
      }
      .details {
        background-color: #f8fafc;
        padding: 15px;
        border-left: 4px solid #0078d4;
        margin: 20px 0;
        border-radius: 0 8px 8px 0;
      }
      .signature {
        margin-top: 30px;
        border-top: 1px solid #e2e8f0;
        padding-top: 20px;
      }
      .logo {
        max-width: 150px;
        height: auto;
        margin: 10px 0;
        display: block;
      }
      .footer-text {
        font-size: 0.85rem;
        color: #64748b;
        margin: 4px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <p>Dear ${studentName},</p>
      
      <p>I hope this email finds you well. We are excited to welcome you at <strong>PaulTech Software Services Pvt Ltd.</strong> as an Intern. Your skills and enthusiasm will be a valuable addition to our team, and we look forward to working with you.</p>
      
      <p>Here are some important details regarding your internship:</p>
      
      <div class="details">
        <strong>Start Date:</strong> ${formattedDate}.<br>
        <strong>Duration :</strong> ${formattedDuration} Months.<br>
        <strong>Things to Bring:</strong> Kindly bring your copy of Aadhar card, 2 Passport Size photographs. Your Laptop (if available).
      </div>
      
      <p>We're excited to have you join us for this session and look forward to working with you. Your contributions will be valuable, and this will be a rewarding experience for you.</p>
      
      <p>If you have any doubts or questions regarding your internship, please feel free to contact us. We are here to help and ensure you have a smooth and successful experience.</p>
      
      <div class="signature">
        <p style="margin: 0; font-weight: bold;">Thanks & Regards,</p>
        <p style="margin: 0; font-weight: bold; color: #0078d4;">HR MANAGER</p>
        <p style="margin: 0; font-weight: bold;">Mrs Daljeet</p>
        <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #475569;">PaulTech Software Services (OPC) Pvt Ltd.</p>
        <img src="cid:paultech_logo" class="logo" alt="PaulTech Logo" />
        <p class="footer-text"><strong>Address:</strong> 34, First Floor, Pacific Height Building, Aam Began, Sakchi, Jamshedpur, Jharkhand-831001</p>
        <p class="footer-text"><strong>Website:</strong> <a href="https://www.paultechsoftwareservices.com" style="color: #0078d4; text-decoration: none;">www.paultechsoftwareservices.com</a></p>
        <p class="footer-text"><strong>Contact No:</strong> 7061272344, 7903174066</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

const sendWelcomeEmail = async (student) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const user = process.env.EMAIL_USER;

  if (brevoApiKey) {
    console.log(`Mailer: Detected BREVO_API_KEY. Sending email via Brevo HTTP API...`);
    try {
      const logoPath = path.join(__dirname, '..', 'logo.png');
      let logoBase64 = '';
      try {
        logoBase64 = fs.readFileSync(logoPath).toString('base64');
      } catch (err) {
        console.error('Failed to read logo.png for Brevo attachment:', err);
      }

      const formattedDate = formatDateString(student.joining_date);
      const formattedDuration = formatDuration(student.duration);
      const htmlContent = getHtmlContent(student.name, formattedDate, formattedDuration);

      const senderEmail = user || 'ganesh.bca2303082@nsuniv.ac.in';

      const body = {
        sender: {
          name: "Daljeet Paul",
          email: senderEmail
        },
        to: [
          {
            email: student.email,
            name: student.name
          }
        ],
        subject: 'Welcome to PAULTECH SOFTWARE SERVICES (OPC) PVT LTD.',
        htmlContent: htmlContent
      };

      if (logoBase64) {
        body.attachment = [
          {
            content: logoBase64,
            name: 'logo.png',
            cid: 'paultech_logo'
          }
        ];
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || `HTTP error ${response.status}`);
      }

      console.log(`Welcome email successfully sent via Brevo HTTP API to ${student.email}: ${resJson.messageId}`);
      return { success: true, messageId: resJson.messageId };
    } catch (error) {
      console.error(`Mailer Error: Failed to send welcome email via Brevo to ${student.email}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Fallback to SMTP
  console.log(`Mailer: No BREVO_API_KEY. Falling back to SMTP connection...`);
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587');
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('Mailer Warning: EMAIL_USER or EMAIL_PASS environment variables are not configured. Welcome email was not sent.');
    return { success: false, error: 'Email configuration missing in backend env' };
  }

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465,
    auth: {
      user: user,
      pass: pass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });

  const formattedDate = formatDateString(student.joining_date);
  const formattedDuration = formatDuration(student.duration);
  const htmlContent = getHtmlContent(student.name, formattedDate, formattedDuration);

  const mailOptions = {
    from: `"Daljeet Paul" <${user}>`,
    to: student.email,
    subject: 'Welcome to PAULTECH SOFTWARE SERVICES (OPC) PVT LTD.',
    html: htmlContent,
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '..', 'logo.png'),
        cid: 'paultech_logo'
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email successfully sent via SMTP to ${student.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Mailer Error: Failed to send welcome email via SMTP to ${student.email}:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWelcomeEmail };
