import { resolve } from "$app/paths";
import { ActionArgs, form } from "$lib/server/remote/form";
import { Forbidden, Redirect } from "$lib/server/remote/responses";
import * as auth from "$lib/server/auth.ts";
import { Effect, Schema } from "effect";
import { ORM, sqlErrorToServerError } from "$lib/server/db/index.ts";

const schema = Schema.Struct({});

export const logout = form(schema, () =>
  Effect.gen(function* () {
    const event = yield* ActionArgs;

    if (!event.locals.session) {
      return yield* new Forbidden({
        message: "You must be logged in to log out",
      });
    }
    yield* auth
      .invalidateSession(event.locals.session.id)
      .pipe(sqlErrorToServerError);
    yield* auth.deleteSessionTokenCookie(event);

    return new Redirect({ to: resolve("/login/"), code: 302 });
  }).pipe(Effect.provide(ORM.Client)),
);
