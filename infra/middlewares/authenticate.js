import { getCookie } from "hono/cookie";
import session from "#models/session.js";
import user from "#models/user.js";

const ANONYMOUS_USER = {
  id: null,
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
      isAnonymous: false,
    });
  } catch (error) {
    console.log(error);
    context.set("user", ANONYMOUS_USER);
  }

  await next();
}
