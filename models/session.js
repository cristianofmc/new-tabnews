import { UnauthorizedError } from "#infra/errors.js";
import crypto from "node:crypto";
import sessionRepository from "#models/session.repository.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000;
const COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-session_id" : "session_id";

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newSession = await sessionRepository.insert(token, userId, expiresAt);
  return newSession;
}

async function findOneValidByToken(sessionToken) {
  const sessionFound = await sessionRepository.findValidByToken(sessionToken);

  if (!sessionFound) {
    throw new UnauthorizedError({
      message: "The user does not have an active session.",
      action: "Please check if this user is logged in and try again.",
    });
  }

  return sessionFound;
}

async function renew(sessionId) {
  return await sessionRepository.updateLifetime(sessionId, "30 days");
}

async function expireById(sessionId) {
  return await sessionRepository.updateLifetime(sessionId, "-1 year");
}

const session = {
  create,
  findOneValidByToken,
  renew,
  expireById,
  EXPIRATION_IN_MILLISECONDS,
  COOKIE_NAME,
};

export default session;
