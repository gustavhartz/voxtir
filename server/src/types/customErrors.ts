export class FileAlreadyExistsError extends Error {
  status: number; // Add the 'status' property here

  constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.status = 409; // 409 Conflict HTTP status code (you can change it to another suitable code)
  }

  statusCode() {
    return this.status;
  }
}
