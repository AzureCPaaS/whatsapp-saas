import { pgTable, text, timestamp, boolean, uuid, jsonb } from "drizzle-orm/pg-core";

// Users Table (represents a workspace/business owner)
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    password_hash: text("password_hash"),     // Optional for OAuth users in future
    phone_number_id: text("phone_number_id"), // WhatsApp API Phone Number ID
    whatsapp_token: text("whatsapp_token"),   // Meta API Access Token
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Verification Tokens Table
export const verificationTokens = pgTable("verification_tokens", {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Contacts Table (audience segments)
export const contacts = pgTable("contacts", {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").references(() => users.id).notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull().unique(), // +1234567890 format
    tags: jsonb("tags").$type<string[]>().default([]),
    status: text("status").notNull().default("subscribed"), // 'subscribed', 'unsubscribed'
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Campaigns Table (broadcast history)
export const campaigns = pgTable("campaigns", {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").references(() => users.id).notNull(),
    name: text("name").notNull(),
    templateName: text("template_name").notNull(),
    audienceCount: text("audience_count").notNull(),
    status: text("status").notNull().default("pending"), // 'pending', 'sending', 'completed'
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Messages Table (chat history via Webhooks)
export const messages = pgTable("messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").references(() => users.id).notNull(),
    contactPhone: text("contact_phone").notNull(),
    direction: text("direction").notNull(), // 'inbound', 'outbound'
    type: text("type").notNull().default("text"), // 'text', 'template'
    content: text("content"),
    status: text("status").notNull().default("sent"), // 'sent', 'delivered', 'read', 'failed'
    metaMessageId: text("meta_message_id").unique(), // The Graph API message ID for tracking webhook receipts
    campaignId: uuid("campaign_id").references(() => campaigns.id), // Link back to campaign for analytics
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
