CREATE TABLE `file` (
	`id` text PRIMARY KEY NOT NULL,
	`fk_event` text NOT NULL,
	`url` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`fk_event`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `routechoice_statistics`;