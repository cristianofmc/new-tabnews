import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import activation from "#models/activation.js";
import { requireSchema } from "#infra/middlewares/validate.js";
import { canRequest } from "#infra/middlewares/authorize.js";
import authorization from "#models/authorization.js";

const { markTokenAsUsed, activateUserByUserId, findOneValidTokenById } =
  activation;

const endpoint = createEndpoint();

endpoint.patch(
  "/api/v1/activations/:token_id",
  requireSchema({}),
  canRequest("read:activation_token"),
  patchHandler,
);

async function patchHandler(context) {
  const userTryingToPatch = context.get("user");
  const activationTokenId = context.req.param("token_id");
  const userToActivate = await findOneValidTokenById(activationTokenId);
  await activateUserByUserId(userToActivate.user_id);
  const usedActivationToken = await markTokenAsUsed(activationTokenId);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:activation_token",
    usedActivationToken,
  );
  return context.json(secureOutputValues, 200);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
