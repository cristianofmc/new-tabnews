import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import user from "#models/user.js";
import validator from "#infra/validators.js";
import activation from "#models/activation.js";
import { requireSchema } from "#infra/middlewares/validate.js";
import { canRequest } from "#infra/middlewares/authorize.js";

const endpoint = createEndpoint();

const userCreationSchema = {
  username: { type: "username", required: true },
  email: { type: "email", required: true },
  password: { type: "password", required: true },
};

endpoint.post(
  "*",
  requireSchema(userCreationSchema),
  canRequest("create:user"),
  postHandler,
);

async function postHandler(context) {
  const userInputValues = await context.req.json();

  validator.validate(userInputValues, userCreationSchema);

  const newUser = await user.create(userInputValues);

  const activationToken = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, activationToken);

  return context.json(newUser, 201);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
