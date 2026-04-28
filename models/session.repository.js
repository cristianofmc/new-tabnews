import database from "#infra/database.js";

async function insert(token, userId, expiresAt) {
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

async function findValidByToken(sessionToken) {
  const result = await database.query({
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

  return result.rows[0] || null;
}

async function updateLifetime(sessionId, intervalString) {
  const result = await database.query({
    text: `
      UPDATE sessions
      SET
        updated_at = NOW(),
        expires_at = NOW() + $2::interval
      WHERE
        id = $1
      RETURNING
        *;
    `,
    values: [sessionId, intervalString],
  });

  return result.rows[0];
}

const sessionRepository = {
  insert,
  findValidByToken,
  updateLifetime,
};

export default sessionRepository;
