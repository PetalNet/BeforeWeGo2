import * as remote from "$app/server";
import {
  error,
  redirect,
  type RemoteQueryFunction,
  type RequestEvent,
} from "@sveltejs/kit";
import { Schema, Effect, pipe, Exit, Cause, Match, Data } from "effect";
import { ActionArgs } from "./form.ts";
import type { Unify } from "effect/Unify";
import type {
  BadRequest,
  Forbidden,
  Redirect,
  ServerError,
} from "./responses.ts";
import type { SqlError } from "@effect/sql";

export type QueryResponse<T> = Redirect | OkQuery<T>;
export type QueryResponseError =
  | BadRequest
  | ServerError
  | Forbidden
  | SqlError.SqlError;

export const matchQueryResponse = <T>() => Match.typeTags<QueryResponse<T>>();
export const matchQueryResponseError = () =>
  Match.typeTags<QueryResponseError>();

export class OkQuery<T> extends Data.TaggedClass("OkQuery")<{
  readonly data: T;
}> {}

type QueryEffect<T> = Effect.Effect<
  QueryResponse<T>,
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
): RemoteQueryFunction<I, Unify<Output>> {
  return remote.query(schema.pipe(Schema.standardSchemaV1), async (data) => {
    const runnable = await pipe(
      fn(data),
      Effect.provideServiceEffect(
        ActionArgs,
        Effect.sync(remote.getRequestEvent),
      ),
      Effect.runPromiseExit,
    );

    return Exit.match<
      QueryResponse<Output>,
      QueryResponseError,
      never,
      Unify<Output>
    >(runnable, {
      onFailure: (cause) => {
        if (Cause.isFailType(cause)) {
          return pipe(
            cause.error,
            matchQueryResponseError()({
              BadRequest: ({ message }) => {
                error(400, {
                  message: message ?? "Bad Request",
                });
              },
              ServerError: ({ message }) => {
                error(500, {
                  message: message ?? "Internal Server Error",
                });
              },
              Forbidden: ({ message }) => {
                error(401, {
                  message: message ?? "Forbidden",
                });
              },
              SqlError: (sqlError) =>
                error(500, {
                  message: sqlError.message,
                }),
            }),
          );
        }

        error(500, cause.toString());
      },
      onSuccess: (data) => {
        return matchQueryResponse<Output>()({
          Redirect: ({ to, code }) => {
            redirect(code, to);
          },
          OkQuery: ({ data }: OkQuery<Output>): Output => data,
        })(data);
      },
    });
  });
}
