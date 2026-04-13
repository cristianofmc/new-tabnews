import argon2 from "argon2";
import { InternalServerError } from "#infra/errors.js";

function getPepper() {
  const pepperString = process.env.PASSWORD_PEPPER;

  if (!pepperString) {
    throw new InternalServerError({
      cause: new Error(
        "The PASSWORD_PEPPER environment variable is not defined.",
      ),
    });
  }

  return Buffer.from(pepperString);
}

export async function hash(password) {
  try {
    const pepperBuffer = getPepper();

    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
      secret: pepperBuffer,
    });
  } catch (error) {
    if (error instanceof InternalServerError) throw error;
    throw new InternalServerError({ cause: error });
  }
}

async function compare(providedPassword, storedPassword) {
  const pepperBuffer = getPepper();

  try {
    const isMatch = await argon2.verify(storedPassword, providedPassword, {
      secret: pepperBuffer,
    });

    return isMatch;
  } catch {
    return false;
  }
}

const password = {
  hash,
  compare,
};

export default password;
