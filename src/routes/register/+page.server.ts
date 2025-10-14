import { hash } from "@node-rs/argon2";
import { encodeBase32LowerCase } from "@oslojs/encoding";
import { fail, redirect, type ActionFailure } from "@sveltejs/kit";
import * as auth from "$lib/server/auth";
import { ORM } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { resolve } from "$app/paths";
import { Schema, Option, Effect, Redacted } from "effect";
import { Email } from "$lib/schemas/email.ts";
import { Password } from "$lib/schemas/password.ts";

const decodeEmail = Schema.decodeUnknownOption(Email);
const decodePassword = Schema.decodeUnknownOption(Password);

export const load = (event): void => {
  if (event.locals.user) {
    redirect(302, resolve("/"));
  }
};

export const actions = {
  register: (event): Promise<ActionFailure<{ message: string }>> =>
    Effect.gen(function* () {
      const formData = yield* Effect.promise(() => event.request.formData());
      const email = decodeEmail(formData.get("email"));
      const password = decodePassword(formData.get("password"));

      if (Option.isNone(email)) {
        return fail(400, { message: "Invalid email" });
      }
      if (Option.isNone(password)) {
        return fail(400, { message: "Invalid password" });
      }

      const userId = generateUserId();
      const passwordHash = yield* Effect.promise((signal) =>
        hash(
          Redacted.value(password.value),
          {
            // recommended minimum parameters
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
          },
          signal,
        ),
      );

      const db = yield* ORM;
      yield* db.insert(table.user).values(
        // TODO
        {
          id: userId,
          email: email.value,
          passwordHash,
          personalEmail: email.value,
          schoolDomain: email.value.split("@").at(-1) ?? "",
          role: "USER",
          status: "PENDING_VERIFICATION",
          profileCompleted: false,
        } as unknown as table.User,
      );

      const sessionToken = auth.generateSessionToken();
      const session = yield* auth.createSession(sessionToken, userId);
      auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

      return redirect(302, "/demo/lucia");
    }).pipe(Effect.provide(ORM.Client), Effect.runPromise),
};

function generateUserId(): string {
  // ID with 120 bits of entropy, or about the same as UUID v4.
  const bytes = crypto.getRandomValues(new Uint8Array(15));
  const id = encodeBase32LowerCase(bytes);
  return id;
}
