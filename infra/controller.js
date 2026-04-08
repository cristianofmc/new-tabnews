import { InternalServerError, MethodNotAllowedError } from "#infra/errors.js";

const controller = {
  errorHandlers: {
    onError(error, context) {
      const publicErrorObject = new InternalServerError({
        statusCode: error.statusCode,
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
