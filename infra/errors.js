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

export class ValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message || "A validation error occurred.", {
      cause,
    });
    this.name = "ValidationError";
    this.action = action || "Please update the submitted data or try again.";
    this.statusCode = 400;
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

export class NotFoundError extends Error {
  constructor({ cause, message, action }) {
    super(message || "This feature could not be found in the system.", {
      cause,
    });
    this.name = "NotFoundError";
    this.action =
      action ||
      "Please verify that the parameters sent in the query are correct.";
    this.statusCode = 404;
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

export class UnauthorizedError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Unauthenticated user.", {
      cause,
    });
    this.name = "UnauthorizedError";
    this.action = action || "Please log in again to continue.";
    this.statusCode = 401;
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

export class ForbiddenError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Access denied.", {
      cause,
    });
    this.name = "ForbiddenError";
    this.action =
      action || "Please check the required features before continuing.";
    this.statusCode = 403;
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
