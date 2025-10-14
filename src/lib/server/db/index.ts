import { env } from "$env/dynamic/private";
import { Reactivity } from "@effect/experimental";
import { SqlClient } from "@effect/sql";
import * as SqliteDrizzle from "@effect/sql-drizzle/Sqlite";
import { LibsqlClient } from "@effect/sql-libsql";
import { Effect, Layer } from "effect";
import * as schema from "./schema.ts";

if (!env["DATABASE_URL"]) throw new Error("DATABASE_URL is not set");

export const SqlClientLive = Layer.scoped(
  SqlClient.SqlClient,
  LibsqlClient.make({
    url: env["DATABASE_URL"],
  }),
).pipe(Layer.provide(Reactivity.layer));

export class ORM extends Effect.Service<ORM>()("ORM", {
  effect: SqliteDrizzle.make({ schema }),
}) {
  static Client = this.Default.pipe(Layer.provideMerge(SqlClientLive));
}

export const SqliteDrizzleLive = SqliteDrizzle.layer.pipe(
  Layer.provideMerge(SqlClientLive),
);
