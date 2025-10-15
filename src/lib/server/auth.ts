import type { RequestEvent } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import { ORM } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { Effect } from "effect";
import type { SqlError } from "@effect/sql/SqlError";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = "auth-session";

export function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return encodeBase64url(bytes);
}

export const createSession = (
  token: string,
  userId: string,
): Effect.Effect<Session, SqlError, ORM> =>
  Effect.gen(function* () {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token)),
    );
    const session: table.Session = {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + DAY_IN_MS * 30),
    };

    const db = yield* ORM;
    yield* db.insert(table.session).values(session);

    return session;
  });

export const validateSessionToken = (
  token: string,
): Effect.Effect<SessionValidationResult, SqlError, ORM> =>
  Effect.gen(function* () {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token)),
    );

    const db = yield* ORM;

    const [result]: { user: User; session: Session }[] = yield* db
      .select({
        // Adjust user table here to tweak returned data
        user: {
          id: table.user.id,
          email: table.user.personalEmail,
          role: table.user.role,
          profilePicture: table.user.profilePicture,
          name: table.user.name,
          graduationYear: table.user.graduationYear,
          schoolDomain: table.user.schoolDomain,
          favoriteMemoryPhoto: table.user.favoriteMemoryPhoto,
        },
        session: table.session,
      })
      .from(table.session)
      .innerJoin(table.user, eq(table.session.userId, table.user.id))
      .where(eq(table.session.id, sessionId));

    if (!result) {
      return { session: undefined, user: undefined };
    }
    const { session, user } = result;

    const sessionExpired = Date.now() >= session.expiresAt.getTime();
    if (sessionExpired) {
      yield* Effect.promise(() =>
        db.delete(table.session).where(eq(table.session.id, session.id)),
      );
      return { session: undefined, user: undefined };
    }

    const renewSession =
      Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
    if (renewSession) {
      session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
      yield* Effect.promise(() =>
        db
          .update(table.session)
          .set({ expiresAt: session.expiresAt })
          .where(eq(table.session.id, session.id)),
      );
    }

    return { session, user };
  });

interface SessionValidationResultNone {
  session: undefined;
  user: undefined;
}
interface SessionValidationResultSome {
  session: Session;
  user: User;
}
interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface GenericUser {
  readonly id: string;
  readonly profilePicture: string;
  readonly name: string;
  readonly graduationYear: number;
}

export interface User extends GenericUser {
  readonly role: "USER" | "ADMIN";
  readonly schoolDomain: string;
  readonly email: string;
}

export interface Classmate extends GenericUser {
  readonly favoriteMemoryPhoto: string;
  readonly favoriteSong?: string | null;
  readonly favoriteArtist?: string | null;
  readonly spotifyTrackId?: string | null;
}

export type SessionValidationResult =
  | SessionValidationResultNone
  | SessionValidationResultSome;

export const invalidateSession = (
  sessionId: string,
): Effect.Effect<void, SqlError, ORM> =>
  Effect.gen(function* () {
    const db = yield* ORM;
    yield* db.delete(table.session).where(eq(table.session.id, sessionId));
  });

export const setSessionTokenCookie = (
  event: RequestEvent,
  token: string,
  expiresAt: Date,
): Effect.Effect<void> =>
  Effect.sync(() => {
    event.cookies.set(sessionCookieName, token, {
      expires: expiresAt,
      path: "/",
    });
  });

export const deleteSessionTokenCookie = (
  event: RequestEvent,
): Effect.Effect<void> =>
  Effect.sync(() => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where -- Not Drizzle API, just a cookie monster.
    event.cookies.delete(sessionCookieName, {
      path: "/",
    });
  });
