import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import user from "#models/user.js";
import { requireSchema } from "#infra/middlewares/validate.js";

const endpoint = createEndpoint();

const updateSchema = {
  username: { type: "username", required: false },
  email: { type: "email", required: false },
  password: { type: "password", required: false },
};

endpoint.get("/api/v1/users/:username", getHandler);
endpoint.patch(
  "/api/v1/users/:username",
  requireSchema(updateSchema),
  patchHandler,
);

async function getHandler(context) {
  const username = context.req.param("username");
  const userFound = await user.findOneByUsername(username);

  return context.json(userFound, 200);
}

async function patchHandler(context) {
  const username = context.req.param("username");
  const updateData = context.get("validatedBody");

  const updatedUser = await user.updateByUsername(username, updateData);

  return context.json(updatedUser, 200);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
