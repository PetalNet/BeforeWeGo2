import { getRequestEvent } from "$app/server";
import { ORM, sqlErrorToServerError } from "$lib/server/db/index.ts";
import { query } from "$lib/server/remote/query";
import { Redirect, ServerError } from "$lib/server/remote/responses";
import { Effect, Schema } from "effect";
import * as table from "$lib/server/db/schema";
import { asc } from "drizzle-orm";
import type { Classmate } from "$lib/server/auth.ts";
import { resolve } from "$app/paths";

export interface CohortInfo {
  readonly year: number;
  readonly count: number;
  readonly domain: string;
}

export interface Cohort {
  readonly users: Classmate[];
  readonly user: Record<string, unknown>;
  readonly cohortInfo: CohortInfo;
}

export const getCohort = query(
  Schema.Void,
  (): Effect.Effect<Cohort, ServerError | Redirect> =>
    Effect.gen(function* () {
      const event = getRequestEvent();
      const user = event.locals.user;
      if (!user) {
        return yield* new Redirect({ to: resolve("/login"), code: 302 });
      }

      const db = yield* ORM;
      const cohortUsers = yield* db
        .select({
          id: table.user.id,
          name: table.user.name,
          profilePicture: table.user.profilePicture,
          graduationYear: table.user.graduationYear,
          favoriteMemoryPhoto: table.user.favoriteMemoryPhoto,
          favoriteSong: table.user.favoriteSong,
          favoriteArtist: table.user.favoriteArtist,
          spotifyTrackId: table.user.spotifyTrackId,
        })
        .from(table.user)
        .orderBy(asc(table.user.name))
        .pipe(sqlErrorToServerError);

      return {
        users: cohortUsers,
        user: {
          id: user.id,
          name: user.name,
          graduationYear: user.graduationYear,
          schoolDomain: user.schoolDomain,
        },
        cohortInfo: {
          domain: user.schoolDomain,
          year: user.graduationYear,
          count: cohortUsers.length,
        },
      };
    }).pipe(Effect.provide(ORM.Client)),
);
