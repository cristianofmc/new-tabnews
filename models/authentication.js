import user from "#models/user.js";
import password from "#models/password.js";
import { NotFoundError, UnauthorizedError } from "#infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const userFound = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, userFound.password);

    return userFound;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Incorrect authentication data.",
        action: "Please verify that the submitted data is correct.",
        cause: error,
      });
    }
    throw error;
  }
}

async function findUserByEmail(providedEmail) {
  let userFound;
  try {
    userFound = await user.findOneByEmail(providedEmail);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: "Incorrect email sent.",
        action: "Please verify that the submitted data is correct.",
        cause: error,
      });
    } else {
      throw error;
    }
  }

  return userFound;
}

async function validatePassword(providedPassword, foundPassword) {
  const correctPasswordMatch = await password.compare(
    providedPassword,
    foundPassword,
  );

  if (!correctPasswordMatch) {
    throw new UnauthorizedError({
      message: "Incorrect password sent.",
      action: "Please verify that the submitted data is correct.",
    });
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
