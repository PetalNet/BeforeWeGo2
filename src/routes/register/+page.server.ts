import { hash } from "@node-rs/argon2";
import { encodeBase32LowerCase } from "@oslojs/encoding";
import { fail, redirect } from "@sveltejs/kit";
import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { resolve } from "$app/paths";
import { Schema, Option } from "effect";
import { Email } from "$lib/schemas/email.ts";
import { Password } from "$lib/schemas/password.ts";

const decodeEmail = Schema.decodeUnknownOption(Email);
const decodePassword = Schema.decodeUnknownOption(Password);

export const load = (event) => {
  if (event.locals.user) {
    return redirect(302, resolve("/demo/lucia"));
  }
  return {};
};

export const actions = {
  register: async (event) => {
    const formData = await event.request.formData();
    const email = decodeEmail(formData.get("email"));
    const password = decodePassword(formData.get("password"));

    if (Option.isNone(email)) {
      return fail(400, { message: "Invalid email" });
    }
    if (Option.isNone(password)) {
      return fail(400, { message: "Invalid password" });
    }

    const userId = generateUserId();
    const passwordHash = await hash(password.value, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    try {
      await db.insert(table.user).values({
        id: userId,
        email: email.value,
        passwordHash,
        personalEmail: email.value,
        schoolDomain: email.value.split("@").at(-1) ?? "",
        role: "USER",
        status: "PENDING_VERIFICATION",
        profileCompleted: false,
      });

      const sessionToken = auth.generateSessionToken();
      const session = await auth.createSession(sessionToken, userId);
      auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
    } catch {
      return fail(500, { message: "An error has occurred" });
    }
    return redirect(302, "/demo/lucia");
  },
};

function generateUserId() {
  // ID with 120 bits of entropy, or about the same as UUID v4.
  const bytes = crypto.getRandomValues(new Uint8Array(15));
  const id = encodeBase32LowerCase(bytes);
  return id;
}
