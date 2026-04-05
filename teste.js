class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

function saveUser(input) {
  if (!input) {
    throw new ReferenceError("An input is required.");
  }

  if (!input.name) {
    throw new ValidationError("Please fill in the name.");
  }

  if (!input.age) {
    throw new ValidationError("Please fill in the age.");
  }

  // user.save(input);
}

function testErrors() {
  try {
    saveUser({});
  } catch (error) {
    if (error instanceof ReferenceError) {
      throw error;
    }

    if (error instanceof ValidationError) {
      console.log(error);
      return;
    }
    console.log(error.stack);
  }
}

testErrors();
