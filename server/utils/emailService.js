const nodemailer = require("nodemailer");

// Email credentials from .env
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Configure the transporter
const transporter = nodemailer.createTransport({
    service: "gmail", // Use your preferred service or SMTP host
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

const sendWelcomeEmail = async (to, name) => {
    const subject = "Welcome to TailorConnect! 🧵";
    
    // Professional HTML Template
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #4A3728; background-color: #F5F1E8; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; border: 1px solid #e0e0e0; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #4A3728; text-decoration: none; font-family: 'Times New Roman', serif; }
            .content { margin-bottom: 30px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #8B6F47; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">TailorConnect</div>
            </div>
            <div class="content">
                <h2>Welcome, ${name}!</h2>
                <p>We are thrilled to have you join our community of expert tailors and fashion enthusiasts.</p>
                <p>Whether you are here to find the perfect fit or showcase your craftsmanship, TailorConnect is your platform.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://tailorconnect.vercel.app/login" class="button">Go to Dashboard</a>
                </div>
                <p>If you have any questions, feel free to reply to this email.</p>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} TailorConnect. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        console.log(`Attempting to send email to: ${to}`);
        console.log(`Using credentials: ${EMAIL_USER ? 'Set' : 'Not Set'}`);
        
        const info = await transporter.sendMail({
            from: '"TailorConnect Team" <no-reply@tailorconnect.com>',
            to: to,
            subject: subject,
            html: html,
        });
        console.log("Welcome email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending welcome email DETAILS:", error);
        return null;
    }
};

module.exports = { sendWelcomeEmail };
