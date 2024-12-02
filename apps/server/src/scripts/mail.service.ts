import nodemailer from 'nodemailer';
export async function sendEmailOTP(email: string, otp: string, message?: string) {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 465,
    auth: {
      user: process.env.SMTP_USER, // Your email from .env
      pass: process.env.SMTP_PASS, // Your app password from .env
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.SMTP_USER, // Sender address
    to: email, // Recipient email address
    subject: 'Your OTP Code', // Subject line
    text: message ?? `Your OTP code is: ${otp}`, // Plain text body
    html: `<p>${message ?? `${message}. `}Your OTP code is: <b>${otp}</b></p>`, // HTML body
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error };
  }
}

// make a curried function to set message opt of sign up and use sendEmailOTP
export async function sendEmailSignupOTP(email: string, otp: string) {
  return sendEmailOTP(email, otp, 'Hey, here is your 6 digit signup otp please verify your email.');
}

export async function sendEmailLoginOTP(email: string, otp: string) {
  return sendEmailOTP(email, otp, 'Hey, here is your 6 digit login otp please verify your email.');
}
