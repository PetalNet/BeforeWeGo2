import * as remote from "$app/server";
import {
  type RemoteFormInput,
  type RemoteForm,
  error,
  redirect,
  type RequestEvent,
} from "@sveltejs/kit";
import {
  Cause,
  Context,
  Data,
  Effect,
  Exit,
  Match,
  pipe,
  Schema,
} from "effect";
import {
  type BadRequest,
  type Forbidden,
  type Redirect,
  type ServerError,
} from "./responses.ts";
import type { SqlError } from "@effect/sql";

export type FormResponseError =
  | BadRequest
  | Redirect
  | Forbidden
  | ServerError
  | ValidationError
  | SqlError.SqlError;

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly fieldErrors: string[];
  readonly message?: string;
  readonly cause?: unknown;
}> {}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Just infer the freaking thingie! Pretty please?
export const matchFormResponseError = () => Match.typeTags<FormResponseError>();

export const ActionArgs = Context.GenericTag<RequestEvent>("ActionArgs");

type FormEffect<Response> = Effect.Effect<
  Response,
  FormResponseError,
  RequestEvent
>;

/**
 * Creates a form object that can be spread onto a `<form>` element.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#form) for full documentation.
 *
 * @since 2.27
 */
export function form<
  A extends Record<string, unknown>,
  I extends RemoteFormInput,
  Output,
>(
  schema: Schema.Schema<A, I>,
  fn: (data: A) => FormEffect<Output>,
): RemoteForm<I, Output> {
  return remote.form(
    schema.pipe(Schema.standardSchemaV1),
    async (data, invalid) => {
      const runnable = await pipe(
        fn(data),
        Effect.provideServiceEffect(
          ActionArgs,
          Effect.sync(remote.getRequestEvent),
        ),
        Effect.runPromiseExit,
      );

      return Exit.getOrElse<Output, FormResponseError, never>(
        runnable,
        (cause) => {
          console.error(
            "Unexpected error in form action:",
            cause.pipe(Cause.pretty),
          );

          if (Cause.isFailType(cause)) {
            return pipe(
              cause.error,
              matchFormResponseError()({
                BadRequest: ({ message }) => {
                  error(400, {
                    message: message,
                  });
                },
                ServerError: ({ message }) => {
                  error(500, {
                    message: message,
                  });
                },
                Forbidden: ({ message }) => {
                  error(401, {
                    message: message,
                  });
                },
                ValidationError: (validationError) =>
                  invalid(...validationError.fieldErrors),
                SqlError: ({ message }) =>
                  error(500, {
                    message: message,
                  }),

                Redirect: ({ to, code }) => {
                  redirect(code, to);
                },
              }),
            );
          }

          error(500, cause.toString());
        },
      );
    },
  );
}
