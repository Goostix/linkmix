CREATE TABLE `link_config` (
	`id` integer PRIMARY KEY NOT NULL,
	`raw_text` text NOT NULL,
	`owner_email` text NOT NULL,
	`updated_at` integer NOT NULL
);
