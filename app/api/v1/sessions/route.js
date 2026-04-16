import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import validator from "#infra/validators.js";
import { UnauthorizedError } from "#infra/errors.js";
import user from "#models/user.js";
import password from "#models/password.js";

const endpoint = createEndpoint();

endpoint.post("*", postHandler);

async function postHandler(context) {
  const userInputValues = await context.req.json();

  const requiredFields = ["email", "password"];

  validator.validatePayload(userInputValues, requiredFields, requiredFields);

  validator.validateEmail(userInputValues.email);
  validator.validateNotBlank(userInputValues.password, "password");

  try {
    const userFound = await user.findOneByEmail(userInputValues.email);
    const correctPasswordMatch = await password.compare(
      userInputValues.password,
      userFound.password,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Incorrect password sent.",
        action: "Please verify that the submitted data is correct.",
      });
    }
  } catch {
    throw new UnauthorizedError({
      message: "Incorrect authentication data.",
      action: "Please verify that the submitted data is correct.",
    });
  }

  return context.json({}, 201);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
