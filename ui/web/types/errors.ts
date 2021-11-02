export interface ErrorMessage {
  name: string;
  message: string;
  code: string;
}

export type ErrorMessageType = ErrorMessage;

export class TokenExpiredError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = 'TokenExpiredError';
    this.stack = (<any>new Error()).stack;
  }
}
