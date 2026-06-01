const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using SMTP configuration from .env
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Define the email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || 'AutoFix'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html // Optional HTML support
  };

  // Send the email
  const info = await transporter.sendMail(mailOptions);
  
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
