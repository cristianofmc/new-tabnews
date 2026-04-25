import email from "#infra/email.js";

describe("infra/email.js", () => {
  test("send()", async () => {
    await email.send({
      from: "Concat <contato@cristianofelipe.com>",
      to: "fin@cristianofelipe.com",
      subject: "email test",
      text: "body test",
    });
  });
});
