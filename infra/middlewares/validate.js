import validator from "#infra/validators.js";

export function requireSchema(schema) {
  return async (context, next) => {
    const bodyText = await context.req.text();
    let body = {};

    if (bodyText) {
      body = JSON.parse(bodyText);
    }

    validator.validate(body, schema);

    context.set("validatedBody", body);
    await next();
  };
}
