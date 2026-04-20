import database from "#infra/database.js";
import { UnauthorizedError } from "#infra/errors.js";
import crypto from "node:crypto";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000;

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");

  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;
}

async function findOneValidByToken(sessionToken) {
  const sessionFound = await runSelectTokenQuery(sessionToken);
  return sessionFound;
}

async function runSelectTokenQuery(sessionToken) {
  const results = await database.query({
    text: `
      SELECT
        *
      FROM
        sessions
      WHERE
        token = $1
        AND
        expires_at > NOW()
      LIMIT
        1
      ;`,
    values: [sessionToken],
  });

  if (results.rowCount === 0) {
    throw new UnauthorizedError({
      message: "The user does not have an active session.",
      action: "Please check if this user is logged in and try again.",
    });
  }

  return results.rows[0];
}

async function runInsertQuery(token, userId, expiresAt) {
  const result = await database.query({
    text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,
    values: [token, userId, expiresAt],
  });

  return result.rows[0];
}

const session = { create, findOneValidByToken, EXPIRATION_IN_MILLISECONDS };

export default session;
