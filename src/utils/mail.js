import mailgen from "mailgen";

const emailVerificationMailgenContent = (username, verificationUrl) => {
   return {
      body: {
         name: username,
         intro: "Welcome to our app! We're very excited to have you on board.",
         action: {
            instructions: "To get started with our app, please click here:",
            button: {
               color: "#22BC66",
               text: "Verify your email",
               link: verificationUrl,
            },
         },
         outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
   };
};

const forgotPasswordMailgenContent = (fullname, passwordResetUrl) => {
   return {
      body: {
         name: fullname,
         intro: "You have requested to reset your password.",
         action: {
            instructions:
               "To reset your password, please click the following link or link:",
            button: {
               color: "#22BC66",
               text: "Reset your password",
               link: passwordResetUrl,
            },
         },
         outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
   };
};

export { emailVerificationMailgenContent, forgotPasswordMailgenContent };
