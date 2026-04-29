import database from "#infra/database.js";

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
  const result = await database.query({
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

  return result.rows[0] || null;
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

const activationRepository = {
  insert,
  select,
  selectValid,
};

export default activationRepository;
