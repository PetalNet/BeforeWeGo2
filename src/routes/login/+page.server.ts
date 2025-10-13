import { verify } from "@node-rs/argon2";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
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
  login: async (event) => {
    const formData = await event.request.formData();
    const email = decodeEmail(formData.get("email"));
    const password = decodePassword(formData.get("password"));

    if (Option.isNone(email)) {
      return fail(400, {
        message: "Invalid email",
      });
    }
    if (Option.isNone(password)) {
      return fail(400, {
        message: "Invalid password (min 6, max 255 characters)",
      });
    }

    const results = await db
      .select()
      .from(table.user)
      .where(eq(table.user.personalEmail, email.value));

    const existingUser = results.at(0);
    if (!existingUser) {
      return fail(400, { message: "Incorrect email or password" });
    }

    const validPassword = await verify(
      existingUser.passwordHash,
      password.value,
      {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      },
    );
    if (!validPassword) {
      return fail(400, { message: "Incorrect email or password" });
    }

    const sessionToken = auth.generateSessionToken();
    const session = await auth.createSession(sessionToken, existingUser.id);
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

    return redirect(302, "/demo/lucia");
  },
};
