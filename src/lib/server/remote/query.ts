import * as remote from "$app/server";
import {
  error,
  redirect,
  type RemoteQueryFunction,
  type RequestEvent,
} from "@sveltejs/kit";
import { Schema, Effect, pipe, Exit, Cause, Match } from "effect";
import { ActionArgs } from "./form.ts";
import type {
  BadRequest,
  Forbidden,
  Redirect,
  ServerError,
} from "./responses.ts";

export type QueryResponseError =
  | BadRequest
  | Redirect
  | ServerError
  | Forbidden;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Just infer the freaking thingie! Pretty please?
export const matchQueryResponseError = () =>
  Match.typeTags<QueryResponseError>();

type QueryEffect<Response> = Effect.Effect<
  Response,
  QueryResponseError,
  RequestEvent
>;

/**
 * Creates a remote query. When called from the browser, the function will be invoked on the server via a `fetch` call.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#query) for full documentation.
 *
 * @since 2.27
 */
export function query<A, I, Output>(
  schema: Schema.Schema<A, I>,
  fn: (arg: A) => QueryEffect<Output>,
): RemoteQueryFunction<I, Output> {
  return remote.query(schema.pipe(Schema.standardSchemaV1), async (data) => {
    const runnable = await pipe(
      fn(data),
      Effect.provideServiceEffect(
        ActionArgs,
        Effect.sync(remote.getRequestEvent),
      ),
      Effect.runPromiseExit,
    );

    return Exit.getOrElse<Output, QueryResponseError, never>(
      runnable,
      (cause) => {
        if (Cause.isFailType(cause)) {
          return pipe(
            cause.error,
            matchQueryResponseError()({
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

              Redirect: ({ to, code }) => {
                redirect(code, to);
              },
            }),
          );
        }

        error(500, cause.toString());
      },
    );
  });
}
