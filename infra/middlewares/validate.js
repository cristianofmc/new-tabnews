import validator from "#infra/validators.js";

export function requireSchema(schema) {
  return async (context, next) => {
    const body = await context.req.json().catch(() => ({}));

    validator.validate(body, schema);

    context.set("validatedBody", body);
    await next();
  };
}
