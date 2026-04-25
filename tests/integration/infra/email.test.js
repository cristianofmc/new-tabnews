import email from "#infra/email.js";
import orchestrator from "#tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Contact <contact@cristianofelipe.com>",
      to: "fin@cristianofelipe.com",
      subject: "First email test",
      text: "The first email body",
    });

    await email.send({
      from: "Contact <contact@cristianofelipe.com>",
      to: "fin@cristianofelipe.com",
      subject: "Last email test",
      text: "The last email body",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contact@cristianofelipe.com>");
    expect(lastEmail.recipients[0]).toBe("<fin@cristianofelipe.com>");
    expect(lastEmail.subject).toBe("Last email test");
    expect(lastEmail.text).toBe("The last email body\n");
    await orchestrator.deleteAllEmails();
  });
});
