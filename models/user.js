import database from "#infra/database.js";
import { ValidationError, NotFoundError } from "#infra/errors.js";

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const result = await database.query({
      text: `
        INSERT INTO
          users (username, email, password)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return result.rows[0];
  }
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
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

    if (results.rowCount == 0) {
      throw new NotFoundError({
        message: "The username provided was not found.",
        action: "Please check that the username was entered correctly.",
      });
    }

    return results.rows[0];
  }
}

async function updateByUsername(username, updateData) {
  const currentUser = await findOneByUsername(username);

  if (updateData.email && updateData.email !== currentUser.email) {
    await validateUniqueEmail(updateData.email);
  }

  if (updateData.username && updateData.username !== currentUser.username) {
    await validateUniqueUsername(updateData.username);
  }

  const result = await database.query({
    text: `
    UPDATE
      users
    SET
      username = COALESCE($1, username),
      email = COALESCE($2, email),
      updated_at = timezone('utc', now())
    WHERE
      id = $3
    RETURNING
      *
    ;`,
    values: [updateData.username, updateData.email, currentUser.id],
  });

  return result.rows[0];
}

async function validateUniqueEmail(email) {
  const results = await database.query({
    text: `
        SELECT
          email
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        ;`,
    values: [email],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "The email address provided is already registered.",
      action: "Try again with a different email.",
    });
  }
}

async function validateUniqueUsername(username) {
  const results = await database.query({
    text: `
      SELECT
        username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      ;`,
    values: [username],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "The username provided is already registered.",
      action: "Try again with a different username.",
    });
  }
}

const user = { create, findOneByUsername, updateByUsername };
export default user;
