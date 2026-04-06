import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function main() {
    console.log("Cleaning phone numbers in DB by stripping '+' using raw Postgres...");
    try {
        await sql`UPDATE messages SET contact_phone = REPLACE(contact_phone, '+', '') WHERE contact_phone LIKE '+%';`;
        console.log("✅ Messages updated.");

        await sql`UPDATE contacts SET phone = REPLACE(phone, '+', '') WHERE phone LIKE '+%';`;
        console.log("✅ Contacts updated.");

        console.log("Process complete!");
    } catch (e) {
        console.error("Error executing clean up:", e);
    } finally {
        await sql.end();
    }
}
main();
