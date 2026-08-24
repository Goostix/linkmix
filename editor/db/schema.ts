import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const linkConfig = sqliteTable("link_config", {
  id: integer("id").primaryKey(),
  rawText: text("raw_text").notNull(),
  profileJson: text("profile_json").notNull().default("{}"),
  ownerEmail: text("owner_email").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
