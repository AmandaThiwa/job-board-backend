import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Job Board Alerts" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✉️ Email successfully sent to ${options.email}`);
    } catch (error) {
        console.error(`⚠️ Email could not be sent. Error: ${error.message}`);
    }
};

export default sendEmail;