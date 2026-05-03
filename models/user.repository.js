import database from "#infra/database.js";

async function insert(username, email, hashedPassword, features) {
  const results = await database.query({
    text: `
        INSERT INTO
          users (username, email, password, features)
        VALUES
          (LOWER($1), LOWER($2), $3, $4)
        RETURNING
          *
        ;`,
    values: [username, email, hashedPassword, features],
  });

  return results.rows[0];
}

async function update(id, { username, email, hashedPassword }) {
  const results = await database.query({
    text: `
        UPDATE
          users
        SET
          username = COALESCE(LOWER($1), username),
          email = COALESCE(LOWER($2), email),
          password = COALESCE($3, password),
          updated_at = timezone('utc', now())
        WHERE
          id = $4
        RETURNING
          *
        ;`,
    values: [username, email, hashedPassword, id],
  });

  return results.rows[0];
}

async function findByEmail(email) {
  const results = await database.query({
    text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        LIMIT
          1
        ;`,
    values: [email],
  });

  return results.rows[0] || null;
}

async function findByUsername(username) {
  const result = await database.query({
    text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
    values: [username],
  });

  return result.rows[0] || null;
}

async function findById(id) {
  const results = await database.query({
    text: `
        SELECT
          *
        FROM
          users
        WHERE
         id = $1
        LIMIT
          1
        ;`,
    values: [id],
  });
  return results.rows[0] || null;
}

async function existsByEmail(email) {
  const results = await database.query({
    text: `
        SELECT
          1
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        ;`,
    values: [email],
  });

  return results.rowCount > 0;
}

async function existsByUsername(username) {
  const results = await database.query({
    text: `
        SELECT
          1
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        ;`,
    values: [username],
  });

  return results.rowCount > 0;
}

async function updateFeatures(userId, features) {
  const results = await database.query({
    text: `
        UPDATE
          users
        SET
          features = $2,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
        ;`,
    values: [userId, features],
  });

  return results.rows[0];
}

async function addFeatures(userId, features) {
  const results = await database.query({
    text: `
        UPDATE
          users
        SET
          features = array_cat(features, $2),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
        ;`,
    values: [userId, features],
  });

  return results.rows[0];
}

const userRepository = {
  insert,
  update,
  findByEmail,
  findByUsername,
  findById,
  existsByEmail,
  existsByUsername,
  updateFeatures,
  addFeatures,
};

export default userRepository;
