import {
  InternalServerError,
  ValidationError,
  NotFoundError,
  MethodNotAllowedError,
  UnauthorizedError,
} from "#infra/errors.js";

const controller = {
  errorHandlers: {
    onError(error, context) {
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
    },

    onNoMatch(context) {
      const publicErrorObject = new MethodNotAllowedError();
      return context.json(publicErrorObject, publicErrorObject.statusCode);
    },
  },
};

export default controller;
