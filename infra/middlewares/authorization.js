import { getCookie } from "hono/cookie";
import session from "#models/session.js";
import user from "#models/user.js";
import { ForbiddenError } from "#infra/errors.js";

const ANONYMOUS_USER = {
  features: ["read:activation_token", "create:session", "create:user"],
};

export async function injectAnonymousOrUser(context, next) {
  const sessionToken = getCookie(context, session.COOKIE_NAME);

  if (!sessionToken) {
    context.set("user", ANONYMOUS_USER);
    return await next();
  }

  try {
    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userObject = await user.findOneById(sessionObject.userId);

    context.set("user", {
      ...userObject,
    });
  } catch (error) {
    console.log(error);
    context.set("user", ANONYMOUS_USER);
  }

  await next();
}

export function canRequest(feature) {
  return async (context, next) => {
    const userTryingToRequest = context.get("user");

    if (userTryingToRequest.features.includes(feature)) {
      return await next();
    }

    throw new ForbiddenError({
      message: "You do not have permission to perform this action.",
      action: `Please check if your user has the '${feature}' feature.`,
    });
  };
}
