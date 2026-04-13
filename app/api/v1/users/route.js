import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import user from "#models/user.js";
import validator from "#infra/validators.js";

const endpoint = createEndpoint();

endpoint.post("*", postHandler);

async function postHandler(context) {
  const userInputValues = await context.req.json();

  const requiredFields = ["username", "email", "password"];

  validator.validatePayload(userInputValues, requiredFields, requiredFields);

  validator.validateUsername(userInputValues.username);
  validator.validateEmail(userInputValues.email);
  validator.validateNotBlank(userInputValues.password, "password");

  const newUser = await user.create(userInputValues);

  return context.json(newUser, 201);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
