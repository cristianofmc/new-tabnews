import {
  InternalServerError,
  ValidationError,
  NotFoundError,
  MethodNotAllowedError,
  UnauthorizedError,
} from "#infra/errors.js";
import { setCookie } from "hono/cookie";
import session from "#models/session.js";

function setSessionCookie(sessionToken, context) {
  setCookie(context, session.COOKIE_NAME, sessionToken, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    partitioned: process.env.NODE_ENV === "production",
  });
}

function clearSessionCookie(context) {
  setCookie(context, session.COOKIE_NAME, "invalid", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: -1,
    partitioned: process.env.NODE_ENV === "production",
  });
}

function onError(error, context) {
  if (error instanceof SyntaxError && error.message.includes("JSON")) {
    const publicErrorObject = new ValidationError({
      message: "The request body does not contain a valid JSON.",
      action:
        "Please check the syntax of the submitted JSON or ensure the request body is not empty.",
    });
    return context.json(publicErrorObject, publicErrorObject.statusCode);
  }

  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return context.json(error, error.statusCode);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.log("\nHono controller error:");
  console.error(publicErrorObject);

  return context.json(publicErrorObject, publicErrorObject.statusCode);
}

function onNoMatch(context) {
  const publicErrorObject = new MethodNotAllowedError();
  return context.json(publicErrorObject, publicErrorObject.statusCode);
}

const controller = {
  errorHandlers: {
    onError,
    onNoMatch,
  },
  setSessionCookie,
  clearSessionCookie,
};

export default controller;
