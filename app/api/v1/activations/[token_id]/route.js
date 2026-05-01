import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import validator from "#infra/validators.js";
import activation from "#models/activation.js";

const { markTokenAsUsed, activateUserByUserId } = activation;

const endpoint = createEndpoint();

endpoint.patch("/api/v1/activations/:token_id", patchHandler);

async function patchHandler(context) {
  const activationTokenId = context.req.param("token_id");

  const payload = await context.req.json().catch(() => ({}));
  validator.validate(payload, {});

  const usedActivationToken = await markTokenAsUsed(activationTokenId);

  await activateUserByUserId(usedActivationToken.user_id);

  return context.json(usedActivationToken, 200);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
