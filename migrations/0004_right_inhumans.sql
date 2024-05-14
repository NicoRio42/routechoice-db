CREATE TABLE `email_verification` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`fk_user` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`fk_user`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `password_reset` (
	`id` text PRIMARY KEY NOT NULL,
	`fk_user` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`fk_user`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `email_verification_token`;--> statement-breakpoint
DROP TABLE `password_reset_token`;--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_fk_user_unique` ON `email_verification` (`fk_user`);--> statement-breakpoint
CREATE UNIQUE INDEX `password_reset_fk_user_unique` ON `password_reset` (`fk_user`);