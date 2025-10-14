import * as auth from "$lib/server/auth";
import { Effect } from "effect";
import { ORM } from "$lib/server/db/index.ts";

export const handle = async ({ event, resolve }): Promise<Response> =>
  await Effect.gen(function* () {
    const sessionToken = event.cookies.get(auth.sessionCookieName);

    if (!sessionToken) {
      event.locals.user = undefined;
      event.locals.session = undefined;
    } else {
      const { session, user } = yield* auth.validateSessionToken(sessionToken);

      if (session) {
        yield* auth.setSessionTokenCookie(
          event,
          sessionToken,
          session.expiresAt,
        );
      } else {
        yield* auth.deleteSessionTokenCookie(event);
      }

      event.locals.user = user;
      event.locals.session = session;
    }

    return yield* Effect.promise(
      async () =>
        await resolve(event, {
          preload: ({ type }) =>
            type === "font" || type === "js" || type === "css",
        }),
    );
  }).pipe(Effect.provide(ORM.Client), Effect.runPromise);
