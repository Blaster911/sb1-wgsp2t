import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: functions.config().smtp.user,
    pass: functions.config().smtp.pass
  }
});

export const processEmailQueue = functions.firestore
  .document('emailQueue/{emailId}')
  .onCreate(async (snap, context) => {
    const emailData = snap.data();
    const emailRef = snap.ref;

    try {
      await transporter.sendMail({
        from: `"Tech Repair Pro" <${functions.config().smtp.user}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.body,
      });

      await emailRef.update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      });

    } catch (error) {
      console.error('Error sending email:', error);
      await emailRef.update({
        status: 'error',
        error: error.message,
        attempts: admin.firestore.FieldValue.increment(1)
      });
    }
  });