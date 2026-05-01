import { ValidationError, NotFoundError } from "#infra/errors.js";
import password from "#models/password.js";
import userRepository from "#models/user.repository.js";

const default_features = ["read:activation_token"];

async function create(updateData) {
  const email = updateData.email.toLowerCase();
  const username = updateData.username.toLowerCase();

  await validateUniqueEmail(email);
  await validateUniqueUsername(username);

  const hashedPassword = await password.hash(updateData.password);
  const features = default_features;

  return await userRepository.insert(username, email, hashedPassword, features);
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

  return await userRepository.update(currentUser.id, {
    username: newUsername,
    email: newEmail,
    hashedPassword,
  });
}

async function findOneByEmail(email) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new NotFoundError({
      message: "The email provided was not found.",
      action: "Please check that the email was entered correctly.",
    });
  }

  return user;
}

async function findOneByUsername(username) {
  const user = await userRepository.findByUsername(username);

  if (!user) {
    throw new NotFoundError({
      message: "The username provided was not found.",
      action: "Please check that the username was entered correctly.",
    });
  }

  return user;
}

async function findOneById(id) {
  const user = await userRepository.findById(id);

  if (!user) {
    throw new NotFoundError({
      message: "The id provided was not found.",
      action: "Please check that the id was entered correctly.",
    });
  }

  return user;
}

async function validateUniqueEmail(email) {
  const exists = await userRepository.existsByEmail(email);

  if (exists) {
    throw new ValidationError({
      message: "The email address provided is already registered.",
      action: "Please try again with a different email.",
    });
  }
}

async function validateUniqueUsername(username) {
  const exists = await userRepository.existsByUsername(username);

  if (exists) {
    throw new ValidationError({
      message: "The username provided is already registered.",
      action: "Please try again with a different username.",
    });
  }
}

async function setFeatures(userId, features) {
  const updatedUser = await userRepository.updateFeatures(userId, features);
  return updatedUser;
}

const user = {
  create,
  findOneByUsername,
  findOneByEmail,
  findOneById,
  updateByUsername,
  setFeatures,
};

export default user;
