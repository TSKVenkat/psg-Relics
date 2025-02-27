import nodemailer from 'nodemailer';

// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendCapsuleCreationEmail = async (
    userEmail: string,
    capsuleTitle: string,
    unlockDate: Date
) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Your Time Capsule: "${capsuleTitle}" has been created`,
        html: `
      <h1>Your Time Capsule Has Been Created</h1>
      <p>Your time capsule "${capsuleTitle}" has been successfully created and locked.</p>
      <p>It will be unlocked on: <strong>${unlockDate.toLocaleDateString()}</strong> at <strong>${unlockDate.toLocaleTimeString()}</strong></p>
      <p>We'll notify you when it's ready to be opened.</p>
      <p>Thank you for using our Virtual Time Capsule service!</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const sendCapsuleUnlockEmail = async (
    userEmail: string,
    capsuleTitle: string,
    capsuleId: string
) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Your Time Capsule: "${capsuleTitle}" is now unlocked!`,
        html: `
      <h1>Your Time Capsule Is Now Unlocked!</h1>
      <p>Great news! Your time capsule "${capsuleTitle}" is now unlocked and ready to be viewed.</p>
      <p>Click the link below to view your capsule:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/capsule/${capsuleId}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">View My Capsule</a>
      <p>Thank you for using our Virtual Time Capsule service!</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};