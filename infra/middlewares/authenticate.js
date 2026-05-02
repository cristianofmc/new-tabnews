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

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const userObject = await user.findOneById(sessionObject.user_id);

  context.set("user", {
    ...userObject,
    isAnonymous: false,
  });

  await next();
}
