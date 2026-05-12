import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import user from "#models/user.js";
import { requireSchema } from "#infra/middlewares/validate.js";
import { canRequest } from "#infra/middlewares/authorize.js";
import authorization from "#models/authorization.js";
import { ForbiddenError } from "#infra/errors.js";

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
  canRequest("update:user"),
  patchHandler,
);

async function getHandler(context) {
  const userTryingToGet = context.get("user");
  const username = context.req.param("username");
  const userFound = await user.findOneByUsername(username);

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:user",
    userFound,
  );
  return context.json(secureOutputValues, 200);
}

async function patchHandler(context) {
  const username = context.req.param("username");
  const updateData = context.get("validatedBody");

  const userTryingToPatch = context.get("user");
  const targetUser = await user.findOneByUsername(username);

  if (!authorization.can(userTryingToPatch, "update:user", targetUser)) {
    throw new ForbiddenError({
      message: "You do not have permission to update another user.",
      action:
        "Please verify that you have the required feature to update another user.",
    });
  }

  const updatedUser = await user.updateByUsername(username, updateData);
  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:user",
    updatedUser,
  );

  return context.json(secureOutputValues, 200);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
