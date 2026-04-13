import { ValidationError } from "#infra/errors.js";

function validatePayload(payload, allowedFields, requiredFields = []) {
  const data = payload || {};
  const providedFields = Object.keys(data);

  if (providedFields.length === 0) {
    throw new ValidationError({
      message: "No data provided in the request body.",
      action: `Please provide at least one valid field: ${allowedFields.join(", ")}.`,
    });
  }

  if (requiredFields.length > 0) {
    const missingFields = requiredFields.filter(
      (field) => !providedFields.includes(field),
    );

    if (missingFields.length > 0) {
      throw new ValidationError({
        message: `Missing required fields: '${missingFields.join(", ")}'.`,
        action: "Please provide all mandatory fields to proceed.",
      });
    }
  }

  const invalidFields = providedFields.filter(
    (field) => !allowedFields.includes(field),
  );

  if (invalidFields.length > 0) {
    throw new ValidationError({
      message: `Unrecognized or not allowed fields provided: '${invalidFields.join(", ")}'.`,
      action: `Please remove these fields. The only allowed fields are: ${allowedFields.join(", ")}.`,
    });
  }
}

function validateNotBlank(value, fieldName) {
  if (value !== undefined && value !== null) {
    const stringValue = String(value).trim();

    if (stringValue === "") {
      throw new ValidationError({
        message: `The field '${fieldName}' cannot be blank or empty.`,
        action: "Please provide a valid text value.",
      });
    }
  }
}

function validateEmail(email) {
  if (!email) return;

  validateNotBlank(email, "email");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email))) {
    throw new ValidationError({
      message: "The email format is invalid.",
      action: "Please provide a valid email address.",
    });
  }
}

function validateUsername(username) {
  if (!username) return;

  validateNotBlank(username, "username");
  /**
   * Regex Explanation:
   * ^                -> Start of the string
   * (?!.*__)         -> Negative Lookahead: Ensures there are no two consecutive underscores
   * [a-zA-Z0-9]      -> First character: Letter or number only (prevents starting with _)
   * [a-zA-Z0-9_]{1,28} -> Body: Letters, numbers, or underscores (up to 28 characters)
   * [a-zA-Z0-9]      -> Last character: Letter or number only (prevents ending with _)
   * $                -> End of the string
   */
  const usernameRegex = /^(?!.*__)[a-zA-Z0-9][a-zA-Z0-9_]{1,28}[a-zA-Z0-9]$/;

  if (!usernameRegex.test(String(username))) {
    throw new ValidationError({
      message: "The username provided is invalid.",
      action:
        "Please ensure that the username is between 3 and 30 characters, contains only letters, numbers or underscores, does not start or end with underscores, and does not have two consecutive underscores.",
    });
  }
}

function validatePassword(password) {
  if (!password) return;

  validateNotBlank(password, "password");

  /**
   * Regex Explanation:
   * ^                -> Start of the string
   * (?=.*[0-9])      -> Positive Lookahead: At least one digit
   * (?=.*[!@#$%^&*(),.?":{}|<>]) -> Positive Lookahead: At least one special character
   * .{8,100}         -> Length: Minimum 8 and Maximum 100 characters (limit for safety)
   * $                -> End of the string
   */
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,100}$/;

  if (!passwordRegex.test(String(password))) {
    throw new ValidationError({
      message: "The password provided is too weak.",
      action:
        "Please provide a password with at least 8 characters, including at least one number and one special character.",
    });
  }
}

const validator = {
  validatePayload,
  validateNotBlank,
  validateEmail,
  validateUsername,
  validatePassword,
};

export default validator;
