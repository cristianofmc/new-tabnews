import { ForbiddenError } from "#infra/errors.js";
import authorization from "#models/authorization.js";

export function canRequest(feature) {
  return async (context, next) => {
    const userTryingToRequest = context.get("user");

    if (authorization.can(userTryingToRequest, feature)) {
      return await next();
    }

    throw new ForbiddenError({
      message: "You do not have permission to perform this action.",
      action: `Please verify that your user has the '${feature}' feature.`,
    });
  };
}
