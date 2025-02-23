-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
CREATE TABLE `_prisma_migrations` (
	`id` text PRIMARY KEY NOT NULL,
	`checksum` text NOT NULL,
	`finished_at` numeric,
	`migration_name` text NOT NULL,
	`logs` text,
	`rolled_back_at` numeric,
	`started_at` numeric DEFAULT (current_timestamp) NOT NULL,
	`applied_steps_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`characters` text NOT NULL,
	`pinyin` text NOT NULL,
	`meaning` text NOT NULL,
	`frequencyRank` integer NOT NULL,
	`emojiChallenge` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Words_characters_key` ON `Words` (`characters`);--> statement-breakpoint
CREATE TABLE `Phrases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`characters` text NOT NULL,
	`pinyin` text NOT NULL,
	`meaning` text NOT NULL,
	`emojiChallenge` text
);
--> statement-breakpoint
CREATE TABLE `_DrillToWords` (
	`A` text NOT NULL,
	`B` integer NOT NULL,
	FOREIGN KEY (`B`) REFERENCES `Words`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`A`) REFERENCES `Drill`(`slug`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_DrillToWords_AB_unique` ON `_DrillToWords` (`A`,`B`);--> statement-breakpoint
CREATE INDEX `_DrillToWords_B_index` ON `_DrillToWords` (`B`);--> statement-breakpoint
CREATE TABLE `_DrillToPhrases` (
	`A` text NOT NULL,
	`B` integer NOT NULL,
	FOREIGN KEY (`B`) REFERENCES `Phrases`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`A`) REFERENCES `Drill`(`slug`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_DrillToPhrases_AB_unique` ON `_DrillToPhrases` (`A`,`B`);--> statement-breakpoint
CREATE INDEX `_DrillToPhrases_B_index` ON `_DrillToPhrases` (`B`);--> statement-breakpoint
CREATE TABLE `_PhrasesToWords` (
	`A` integer NOT NULL,
	`B` integer NOT NULL,
	FOREIGN KEY (`B`) REFERENCES `Words`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`A`) REFERENCES `Phrases`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `_PhrasesToWords_B_index` ON `_PhrasesToWords` (`B`);--> statement-breakpoint
CREATE UNIQUE INDEX `_PhrasesToWords_AB_unique` ON `_PhrasesToWords` (`A`,`B`);--> statement-breakpoint
CREATE TABLE `Drill` (
	`slug` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`lessonSlug` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`lessonSlug`) REFERENCES `Lesson`(`slug`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `Course` (
	`slug` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`ordering` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Lesson` (
	`slug` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`ordering` integer NOT NULL,
	`courseSlug` text NOT NULL,
	FOREIGN KEY (`courseSlug`) REFERENCES `Course`(`slug`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `__drizzle_migrations` (

);
