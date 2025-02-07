const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

router.post('/api/send-email', async (req, res) => {
  const { fullName, phone, email, pointA, pointB, cost, distance } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'syedh2971@gmail.com',
    subject: 'Новая заявка на доставку',
    html: `
      <h2>Новая заявка на доставку</h2>
      <p><strong>ФИО:</strong> ${fullName}</p>
      <p><strong>Телефон:</strong> ${phone}</p>
      <p><strong>Email клиента:</strong> ${email}</p>
      <p><strong>Точка А:</strong> ${pointA}</p>
      <p><strong>Точка Б:</strong> ${pointB}</p>
      <p><strong>Расстояние:</strong> ${distance}</p>
      <p><strong>Стоимость:</strong> ${cost}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
});

module.exports = router; 