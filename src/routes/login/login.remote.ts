import { resolve } from "$app/paths";
import { loginSchema } from "$lib/schemas/login";
import * as auth from "$lib/server/auth";
import { ORM, sqlErrorToServerError } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { ActionArgs, form, ValidationError } from "$lib/server/remote/form";
import {
  BadRequest,
  Redirect,
  type ServerError,
} from "$lib/server/remote/responses";
import { verify } from "@node-rs/argon2";
import type { RequestEvent } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { Effect, Redacted } from "effect";

export const login = form(
  loginSchema,
  ({
    email,
    _password: password,
  }): Effect.Effect<Redirect, ValidationError | ServerError, RequestEvent> =>
    Effect.gen(function* () {
      const db = yield* ORM;

      const [existingUser] = yield* db
        .select()
        .from(table.user)
        .where(eq(table.user.personalEmail, email))
        .pipe(sqlErrorToServerError);

      if (!existingUser) {
        return yield* new ValidationError({
          fieldErrors: ["Incorrect email or password"],
        });
      }

      const validPassword = yield* Effect.promise((signal) =>
        verify(
          existingUser.passwordHash,
          Redacted.value(password),
          {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
          },
          signal,
        ),
      );
      if (!validPassword) {
        throw new BadRequest({ message: "Incorrect email or password" });
      }

      const event = yield* ActionArgs;
      const sessionToken = auth.generateSessionToken();
      const session = yield* auth
        .createSession(sessionToken, existingUser.id)
        .pipe(sqlErrorToServerError);
      yield* auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

      return new Redirect({ to: resolve("/"), code: 302 });
    }).pipe(Effect.provide(ORM.Client)),
);
