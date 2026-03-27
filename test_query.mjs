import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { eq, and, gt } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

dotenv.config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;
const sql = postgres(dbUrl);
const db = drizzle(sql);

const verificationTokens = pgTable("verification_tokens", {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires").notNull(),
});

async function main() {
    const token = 'e2ec2fa9-3e04-4cc4-9f44-77bfdffea3b5';

    try {
        console.log("==== DEBUGGING TOKEN ====");
        console.log("Token to verify:", token);

        const allTokens = await db.select().from(verificationTokens).where(eq(verificationTokens.token, token));
        console.log("Unfiltered token from DB:", allTokens);

        const now = new Date();
        console.log("Current time locally:", now);

        const tokenResult = await db
            .select()
            .from(verificationTokens)
            .where(
                and(
                    eq(verificationTokens.token, token),
                    gt(verificationTokens.expires, now)
                )
            );

        console.log("Filtered tokenResult:", tokenResult);
    } catch (error) {
        console.error("Error fetching token:", error);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

main();
