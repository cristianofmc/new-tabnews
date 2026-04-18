import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import validator from "#infra/validators.js";
import authentication from "#models/authentication.js";

const endpoint = createEndpoint();

endpoint.post("*", postHandler);

async function postHandler(context) {
  const userInputValues = await context.req.json();
  const loginSchema = {
    email: { type: "notEmptyText", required: true },
    password: { type: "notEmptyText", required: true },
  };

  validator.validate(userInputValues, loginSchema);

  await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  return context.json({}, 201);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
