CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`graduation_year` integer NOT NULL,
	`school_email` text NOT NULL,
	`personal_email` text NOT NULL,
	`school_domain` text NOT NULL,
	`password_hash` text NOT NULL,
	`school_verified_at` integer,
	`personal_verified_at` integer,
	`status` text DEFAULT 'PENDING_VERIFICATION' NOT NULL,
	`role` text DEFAULT 'USER' NOT NULL,
	`profile_picture` text NOT NULL,
	`favorite_memory_photo` text NOT NULL,
	`favorite_song` text,
	`favorite_artist` text,
	`spotify_track_id` text,
	`profile_completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_school_email_unique` ON `user` (`school_email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_personal_email_unique` ON `user` (`personal_email`);--> statement-breakpoint
CREATE INDEX `user_school_domain_idx` ON `user` (`school_domain`);--> statement-breakpoint
CREATE INDEX `user_graduation_year_idx` ON `user` (`graduation_year`);--> statement-breakpoint
CREATE INDEX `user_school_domain_graduation_year_idx` ON `user` (`school_domain`,`graduation_year`);--> statement-breakpoint
CREATE TABLE `verification_token` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`type` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verification_token_token_unique` ON `verification_token` (`token`);