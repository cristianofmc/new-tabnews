import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import user from "#models/user.js";
import validator from "#infra/validators.js";

const endpoint = createEndpoint();

endpoint.get("/api/v1/users/:username", getHandler);
endpoint.patch("/api/v1/users/:username", patchHandler);

async function getHandler(context) {
  const username = context.req.param("username");
  const userFound = await user.findOneByUsername(username);

  return context.json(userFound, 200);
}

async function patchHandler(context) {
  const username = context.req.param("username");
  const updateData = await context.req.json();

  const allowedFields = ["username", "email", "password"];
  validator.validatePayload(updateData, allowedFields);

  if (updateData.username !== undefined) {
    validator.validateUsername(updateData.username);
  }

  if (updateData.email !== undefined) {
    validator.validateEmail(updateData.email);
  }

  if (updateData.password !== undefined) {
    validator.validatePassword(updateData.password);
  }

  const updatedUser = await user.updateByUsername(username, updateData);

  return context.json(updatedUser, 200);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
