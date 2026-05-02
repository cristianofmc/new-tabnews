import email from "#infra/email.js";
import activationRepository from "#models/activation.repository.js";
import config from "#infra/config.js";
import user from "#models/user.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newToken = await activationRepository.insert(userId, expiresAt);
  return newToken;
}

async function findOneValidTokenById(tokenId) {
  const expiresAt = new Date(Date.now());

  const validToken = await activationRepository.selectValid(tokenId, expiresAt);
  return validToken;
}

async function markTokenAsUsed(activationTokenId) {
  const expiresAt = new Date(Date.now());
  const usedActivationToken = await activationRepository.updateUsedToken(
    activationTokenId,
    expiresAt,
  );
  return usedActivationToken;
}

async function activateUserByUserId(userId) {
  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
  ]);
  return activatedUser;
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: `${config.appName} <${config.appEmail}>`,
    to: user.email,
    subject: "Please activate your account.",
    text: `Hi ${user.username},

Welcome to ${config.appName},
please access the link below to activate your account:

${config.origin}/sign_up/activate/${activationToken.id}

If you did not sign up for an account with ${config.appName}, please ignore this email. No further action is required.

Best regards,
The ${config.appName} Team.
`,
  });
}

const activation = {
  sendEmailToUser,
  create,
  findOneValidTokenById,
  markTokenAsUsed,
  activateUserByUserId,
  EXPIRATION_IN_MILLISECONDS,
};

export default activation;
