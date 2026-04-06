import { Hono } from "hono";
import controller from "./controller.js";

export function createEndpoint() {
  const endpoint = new Hono();

  endpoint.onError(controller.errorHandlers.onError);
  endpoint.notFound(controller.errorHandlers.onNoMatch);

  return endpoint;
}
