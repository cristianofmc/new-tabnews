import database from "#infra/database.js";
import { ValidationError, NotFoundError } from "#infra/errors.js";
import password from "#models/password.js";

async function create(updateData) {
  const email = updateData.email.toLowerCase();
  const username = updateData.username.toLowerCase();

  await validateUniqueEmail(email);
  await validateUniqueUsername(username);

  const hashedPassword = await password.hash(updateData.password);

  const result = await database.query({
    text: `
        INSERT INTO
          users (username, email, password)
        VALUES
          (LOWER($1), LOWER($2), $3)
        RETURNING
          *
        ;`,
    values: [username, email, hashedPassword],
  });

  return result.rows[0];
}

async function updateByUsername(currentUsername, updateData) {
  const currentUser = await findOneByUsername(currentUsername);

  const newEmail = updateData.email?.toLowerCase();
  const newUsername = updateData.username?.toLowerCase();

  if (newEmail && newEmail !== currentUser.email) {
    await validateUniqueEmail(newEmail);
  }

  if (newUsername && newUsername !== currentUser.username) {
    await validateUniqueUsername(newUsername);
  }

  let hashedPassword = null;

  if (updateData.password) {
    const isSamePassword = await password.compare(
      updateData.password,
      currentUser.password,
    );

    if (isSamePassword) {
      throw new ValidationError({
        message: "The new password cannot be the same as the current password.",
        action: "Please choose a different password to enhance your security.",
      });
    }

    hashedPassword = await password.hash(updateData.password);
  }

  const result = await database.query({
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
    values: [newUsername, newEmail, hashedPassword, currentUser.id],
  });

  return result.rows[0];
}

async function findOneByEmail(email) {
  const result = await database.query({
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

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "The email provided was not found.",
      action: "Please check that the email was entered correctly.",
    });
  }
  return result.rows[0];
}

async function findOneByUsername(username) {
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

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "The username provided was not found.",
      action: "Please check that the username was entered correctly.",
    });
  }

  return result.rows[0];
}

async function validateUniqueEmail(email) {
  const result = await database.query({
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

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "The email address provided is already registered.",
      action: "Please try again with a different email.",
    });
  }
}

async function validateUniqueUsername(username) {
  const result = await database.query({
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

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "The username provided is already registered.",
      action: "Please try again with a different username.",
    });
  }
}

const user = { create, findOneByUsername, findOneByEmail, updateByUsername };
export default user;
