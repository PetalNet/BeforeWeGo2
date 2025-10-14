import { Data } from "effect";

export type RedirectStatus =
  | 300
  | 301
  | 302
  | 303
  | 304
  | 305
  | 306
  | 307
  | 308;

export class Redirect extends Data.TaggedClass("Redirect")<{
  readonly to: string;
  readonly code: RedirectStatus | ({} & number);
}> {}

export class Forbidden extends Data.TaggedError("Forbidden")<{
  readonly errors?: string[];
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class BadRequest extends Data.TaggedError("BadRequest")<{
  readonly errors?: string[];
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class ServerError extends Data.TaggedError("ServerError")<{
  readonly errors?: string[];
  readonly message: string;
  readonly cause?: unknown;
}> {}
