import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

// Enums
export const userStatusEnum = [
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
] as const;
export const userRoleEnum = ["USER", "ADMIN"] as const;

export type UserStatus = (typeof userStatusEnum)[number];
export type UserRole = (typeof userRoleEnum)[number];

export const user = sqliteTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    graduationYear: integer("graduation_year").notNull(),
    schoolEmail: text("school_email").notNull().unique(),
    personalEmail: text("personal_email").notNull().unique(),
    schoolDomain: text("school_domain").notNull(),
    passwordHash: text("password_hash").notNull(),
    schoolVerifiedAt: integer("school_verified_at", { mode: "timestamp" }),
    personalVerifiedAt: integer("personal_verified_at", { mode: "timestamp" }),
    status: text("status", { enum: userStatusEnum })
      .notNull()
      .default("PENDING_VERIFICATION"),
    role: text("role", { enum: userRoleEnum }).notNull().default("USER"),

    // Profile fields
    profilePicture: text("profile_picture"),
    favoriteMemoryPhoto: text("favorite_memory_photo"),
    favoriteSong: text("favorite_song"),
    favoriteArtist: text("favorite_artist"),
    spotifyTrackId: text("spotify_track_id"),
    profileCompleted: integer("profile_completed", { mode: "boolean" })
      .notNull()
      .default(false),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("user_school_domain_idx").on(table.schoolDomain),
    index("user_graduation_year_idx").on(table.graduationYear),
    index("user_school_domain_graduation_year_idx").on(
      table.schoolDomain,
      table.graduationYear,
    ),
  ],
);

export const verificationToken = sqliteTable("verification_token", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  type: text("type").notNull(), // e.g., "EMAIL_VERIFICATION", "PASSWORD_RESET"
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type VerificationToken = typeof verificationToken.$inferSelect;
