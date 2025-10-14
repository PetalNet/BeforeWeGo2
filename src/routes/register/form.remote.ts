import { Redacted } from "effect";
import { form, ValidationError } from "$lib/server/remote/form";
import { Effect } from "effect";
import { ORM } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import * as auth from "$lib/server/auth";
import { ActionArgs } from "$lib/server/remote/form";
import { Redirect } from "$lib/server/remote/responses";
import { resolve } from "$app/paths";
import { fullRegistrationSchema } from "$lib/schemas/register.ts";

export const register = form(fullRegistrationSchema, (data) =>
  Effect.gen(function* () {
    const db = yield* ORM;
    const event = yield* ActionArgs;

    // Check if school email already exists
    const [existingSchool] = yield* db
      .select()
      .from(table.user)
      .where(eq(table.user.schoolEmail, data.schoolEmail));

    if (existingSchool) {
      return yield* new ValidationError({
        fieldErrors: ["School email already registered"],
      });
    }

    // Check if personal email already exists
    const [existingPersonal] = yield* db
      .select()
      .from(table.user)
      .where(eq(table.user.personalEmail, data.personalEmail));

    if (existingPersonal) {
      return yield* new ValidationError({
        fieldErrors: ["Personal email already registered"],
      });
    }

    // Hash the password
    const passwordHash = yield* Effect.promise((signal) =>
      hash(
        Redacted.value(data._password),
        {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        },
        signal,
      ),
    );

    // Extract school domain
    const schoolDomain = data.schoolEmail.split("@")[1] ?? "";
    if (!schoolDomain) {
      return yield* new ValidationError({
        fieldErrors: ["Invalid school email domain"],
      });
    }

    // Create the user with placeholder images
    const userId = crypto.randomUUID();
    const newUser: typeof table.user.$inferInsert = {
      id: userId,
      name: data.name,
      graduationYear: data.graduationYear,
      schoolEmail: data.schoolEmail,
      personalEmail: data.personalEmail,
      schoolDomain,
      passwordHash,
      profilePicture: "/default-avatar.png", // Placeholder
      favoriteMemoryPhoto: "/default-memory.png", // Placeholder
      status: "PENDING_VERIFICATION",
      role: "USER",
    };

    yield* db.insert(table.user).values(newUser);

    // Create session
    const sessionToken = auth.generateSessionToken();
    const session = yield* auth.createSession(sessionToken, userId);
    yield* auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

    return new Redirect({ to: resolve("/profile/edit"), code: 302 });
  }).pipe(Effect.provide(ORM.Client)),
);
