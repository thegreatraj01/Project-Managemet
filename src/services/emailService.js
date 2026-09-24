import mailgen from "mailgen";
import { BrevoClient } from "@getbrevo/brevo";

import {
   emailVerificationMailgenContent,
   forgotPasswordMailgenContent,
} from "../utils/mail.js";

// Creates HTML and plain-text email content using the default Mailgen theme.
const mailGenerator = new mailgen({
   theme: "default",
   product: {
      name: process.env.APP_NAME,
      link: process.env.APP_URL,
   },
});

// Uses Brevo's HTTPS API to send transactional emails.
const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

/**
 * Generates HTML and plain-text content, then sends the email through Brevo.
 *
 * @param {string} toEmail - Recipient's email address.
 * @param {string} subject - Email subject.
 * @param {object} mailgenContent - Mailgen content definition.
 * @returns {Promise<object>} Brevo API response.
 */
const sendMail = async (toEmail, subject, mailgenContent) => {
   const htmlContent = mailGenerator.generate(mailgenContent);
   const textContent = mailGenerator.generatePlaintext(mailgenContent);

   try {
      return await brevo.transactionalEmails.sendTransacEmail({
         subject,
         htmlContent,
         textContent,
         sender: {
            name: process.env.SENDER_NAME,
            email: process.env.SENDER_EMAIL,
         },
         to: [{ email: toEmail }],
      });
   } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Unable to send email");
   }
};

/**
 * Sends an email containing the user's email verification link.
 *
 * @param {string} toEmail - Recipient's email address.
 * @param {string} username - Name displayed in the email.
 * @param {string} verificationUrl - Email verification link.
 * @returns {Promise<object>} Brevo API response.
 */
const sendVerificationEmail = async (toEmail, username, verificationUrl) => {
   return sendMail(
      toEmail,
      "Verify your email address",
      emailVerificationMailgenContent(username, verificationUrl),
   );
};

/**
 * Sends an email containing the user's password reset link.
 *
 * @param {string} toEmail - Recipient's email address.
 * @param {string} fullname - Name displayed in the email.
 * @param {string} passwordResetUrl - Password reset link.
 * @returns {Promise<object>} Brevo API response.
 */
const sendForgotPasswordEmail = async (toEmail, fullname, passwordResetUrl) => {
   return sendMail(
      toEmail,
      "Reset your password",
      forgotPasswordMailgenContent(fullname, passwordResetUrl),
   );
};

export { sendVerificationEmail, sendForgotPasswordEmail };
