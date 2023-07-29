CREATE TABLE `asso_event_tag` (
	`fk_event` text,
	`fk_tag` text,
	PRIMARY KEY(`fk_event`, `fk_tag`),
	FOREIGN KEY (`fk_event`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fk_tag`) REFERENCES `tag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `control_point` (
	`id` text PRIMARY KEY NOT NULL,
	`fk_event` text NOT NULL,
	`code` text NOT NULL,
	`longitude` real NOT NULL,
	`latitude` real NOT NULL,
	FOREIGN KEY (`fk_event`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `email_verification_token` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `event` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`start_time` integer NOT NULL,
	`finish_time` integer NOT NULL,
	`publish_time` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `auth_key` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`hashed_password` text,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `leg` (
	`id` text PRIMARY KEY NOT NULL,
	`fk_event` text NOT NULL,
	`fk_start_control_point` text NOT NULL,
	`fk_finish_control_point` text NOT NULL,
	FOREIGN KEY (`fk_event`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fk_start_control_point`) REFERENCES `control_point`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fk_finish_control_point`) REFERENCES `control_point`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `live_event` (
	`id` text PRIMARY KEY NOT NULL,
	`fk_event` text NOT NULL,
	`live_provider` text NOT NULL,
	`url` text NOT NULL,
	`is_primary` boolean NOT NULL,
	FOREIGN KEY (`fk_event`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `password_reset_token` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `routechoice` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`fk_leg` text NOT NULL,
	`longitudes` text NOT NULL,
	`latitudes` text NOT NULL,
	`length` integer NOT NULL,
	FOREIGN KEY (`fk_leg`) REFERENCES `leg`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `routechoice_statistics` (
	`id` text PRIMARY KEY NOT NULL,
	`fk_routchoice` text NOT NULL,
	`number_of_runners` integer DEFAULT 0 NOT NULL,
	`best_time` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`fk_routchoice`) REFERENCES `routechoice`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `runner` (
	`id` text PRIMARY KEY NOT NULL,
	`fk_event` text NOT NULL,
	`fk_user` text,
	`fk_live_event` text,
	`tracking_device_id` text,
	`status` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`start_time` integer NOT NULL,
	`time` integer,
	`rank` integer,
	`time_behind` integer,
	`total_time_lost` integer DEFAULT 0 NOT NULL,
	`time_offset` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`fk_event`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fk_user`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`fk_live_event`) REFERENCES `live_event`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `runner_leg` (
	`id` text PRIMARY KEY NOT NULL,
	`fk_detected_routechoice` text,
	`fk_manual_routechoice` text,
	`fk_leg` text NOT NULL,
	`fk_runner` text NOT NULL,
	`time_overall` integer NOT NULL,
	`time` integer NOT NULL,
	`rank_split` integer NOT NULL,
	`time_behind_split` integer NOT NULL,
	`rank_overall` integer,
	`time_behind_overall` integer,
	`time_behind_superman` integer,
	`time_loss` integer NOT NULL,
	`routechoice_time_loss` integer NOT NULL,
	FOREIGN KEY (`fk_detected_routechoice`) REFERENCES `routechoice`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fk_manual_routechoice`) REFERENCES `routechoice`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fk_leg`) REFERENCES `leg`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fk_runner`) REFERENCES `runner`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `auth_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`active_expires` integer NOT NULL,
	`idle_expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `auth_user` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` boolean DEFAULT false NOT NULL,
	`password_expired` boolean DEFAULT false NOT NULL,
	`role` text DEFAULT 'default' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tag_name_unique` ON `tag` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `tag_color_unique` ON `tag` (`color`);