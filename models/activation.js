import email from "#infra/email.js";

async function sendEmailToUser(user) {
  await email.send({
    from: "Cristiano Felipe <contact@cristianofelipe.com>",
    to: user.email,
    subject: "Please activate your account.",
    text: `Hi ${user.username},

Welcome to Cristiano Felipe connection,
please access the link below to activate your account:

https://link...

If you did not sign up for an account with Cristiano Felipe connection, please ignore this email. No further action is required.

Best regards,
The Cristiano Felipe Team.
`,
  });
}

const activation = {
  sendEmailToUser,
};

export default activation;
