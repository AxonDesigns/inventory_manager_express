export class DatabaseError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export class ValidationError extends Error {
  errors: string[];
  constructor(errors: string[]) {
    super("Validation Error");
    this.errors = errors;
  }
}