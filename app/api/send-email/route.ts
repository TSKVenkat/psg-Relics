import { NextRequest, NextResponse } from 'next/server';
import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: parseInt(process.env.EMAIL_PORT || "587") === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

type EmailOptions = {
    to: string;
    subject: string;
    text: string;
    html: string;
};

async function sendEmail({ to, subject, text, html }: EmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html,
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;

        if (!type || !data) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let result;

        if (type === 'capsuleNotification') {
            const { email, capsuleName, unlockUrl } = data;
            if (!email || !capsuleName || !unlockUrl) {
                return NextResponse.json({ error: 'Missing required fields for notification' }, { status: 400 });
            }

            const subject = `Your Time Capsule "${capsuleName}" is now unlocked!`;
            const text = `Your time capsule "${capsuleName}" is now unlocked and ready to view. Visit ${unlockUrl} to see your memories.`;
            const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Your Time Capsule is Unlocked!</h2>
              <p>Hello,</p>
              <p>Your time capsule "${capsuleName}" is now unlocked and ready to view.</p>
              <p><a href="${unlockUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">View Your Capsule</a></p>
              <p>Enjoy revisiting your memories!</p>
              <p>Time Capsule Team</p>
            </div>
          `;

            result = await sendEmail({ to: email, subject, text, html });
        } else if (type === 'capsuleShare') {
            const { toEmail, fromName, capsuleName, shareUrl } = data;
            if (!toEmail || !fromName || !capsuleName || !shareUrl) {
                return NextResponse.json({ error: 'Missing required fields for share' }, { status: 400 });
            }

            const subject = `${fromName} has shared a Time Capsule with you`;
            const text = `${fromName} has shared their time capsule "${capsuleName}" with you. Visit ${shareUrl} to view it.`;
            const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Time Capsule Shared With You</h2>
              <p>Hello,</p>
              <p>${fromName} has shared their time capsule "${capsuleName}" with you.</p>
              <p><a href="${shareUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">View Shared Capsule</a></p>
              <p>Time Capsule Team</p>
            </div>
          `;

            result = await sendEmail({ to: toEmail, subject, text, html });
        } else {
            return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        if (result.success) {
            return NextResponse.json({ success: true, messageId: result.messageId });
        } else {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error processing email request:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}