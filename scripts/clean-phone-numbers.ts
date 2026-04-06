import 'dotenv/config';
import { db } from '../src/db/index.js';
import { messages, contacts } from '../src/db/schema.js';
import { sql } from 'drizzle-orm';

async function main() {
    console.log("Cleaning phone numbers in DB by stripping '+'...");
    try {
        // Strip '+' from messages.contactPhone
        await db.execute(sql`UPDATE ${messages} SET contact_phone = REPLACE(contact_phone, '+', '') WHERE contact_phone LIKE '+%';`);
        console.log("✅ Messages updated.");

        // Strip '+' from contacts.phone
        await db.execute(sql`UPDATE ${contacts} SET phone = REPLACE(phone, '+', '') WHERE phone LIKE '+%';`);
        console.log("✅ Contacts updated.");

        console.log("Process complete! Exiting...");
        process.exit(0);
    } catch (e) {
        console.error("Error executing clean up:", e);
        process.exit(1);
    }
}

main();
