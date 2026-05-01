import { Hono } from "hono";
import controller from "./controller.js";
import { injectAnonymousOrUser } from "./middlewares/authorization.js";

export function createEndpoint() {
  const endpoint = new Hono();

  endpoint.use("*", injectAnonymousOrUser);
  endpoint.onError(controller.errorHandlers.onError);
  endpoint.notFound(controller.errorHandlers.onNoMatch);

  return endpoint;
}
