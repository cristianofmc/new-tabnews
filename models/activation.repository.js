import database from "#infra/database.js";
import { NotFoundError } from "#infra/errors.js";

async function insert(userId, expiresAt) {
  const results = await database.query({
    text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
        ;`,
    values: [userId, expiresAt],
  });
  return results.rows[0];
}

async function selectValid(tokenId, expiresAt) {
  const results = await database.query({
    text: `
      SELECT
        *
      FROM
        user_activation_tokens
      WHERE
        id = $1
      AND
        expires_at > $2
      AND
        used_at IS NULL
      LIMIT
        1
      ;`,
    values: [tokenId, expiresAt],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message:
        "The activation token provided was not found in the system or has expired.",
      action: "Please create a new account.",
    });
  }

  return results.rows[0] || null;
}

async function select(userId) {
  const result = await database.query({
    text: `
      SELECT
        *
      FROM
        user_activation_tokens
      WHERE
        user_id = $1
      LIMIT
        1
      ;`,
    values: [userId],
  });

  return result.rows[0] || null;
}

async function updateUsedToken(activationTokenId, expiresAt) {
  const results = await database.query({
    text: `
      UPDATE
        user_activation_tokens
      SET
        used_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      AND
        expires_at > $2
      AND
        used_at IS NULL
      RETURNING
          *
      ;`,
    values: [activationTokenId, expiresAt],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message:
        "The activation token provided was not found in the system or has expired.",
      action: "Please create a new account.",
    });
  }

  return results.rows[0];
}

const activationRepository = {
  insert,
  select,
  selectValid,
  updateUsedToken,
};

export default activationRepository;
