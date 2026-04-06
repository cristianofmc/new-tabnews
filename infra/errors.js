export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("An unexpected error occurred.", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Please contact the service administrator.";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Service currently unavailable.", {
      cause,
    });
    this.name = "ServiceError";
    this.action = "Please contact the service administrator.";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("This method is not allowed for this endpoint.");
    this.name = "MethodNotAllowedError";
    this.action = "Please verify that the HTTP method is valid.";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
