import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function main() {
    console.log("Cleaning phone numbers safely resolving unique constraints...");
    try {
        await sql`UPDATE messages SET contact_phone = REPLACE(contact_phone, '+', '') WHERE contact_phone LIKE '+%';`;
        console.log("✅ Messages updated.");

        const plusContacts = await sql`SELECT id, phone FROM contacts WHERE phone LIKE '+%';`;
        for (const contact of plusContacts) {
            const strippedPhone = contact.phone.replace('+', '');
            const existing = await sql`SELECT id FROM contacts WHERE phone = ${strippedPhone}`;
            if (existing.length > 0) {
                console.log(`Duplicate found for ${strippedPhone}. Deleting the + version. (ID: ${contact.id})`);
                await sql`DELETE FROM contacts WHERE id = ${contact.id}`;
            } else {
                console.log(`Updating ${contact.phone} to ${strippedPhone}`);
                await sql`UPDATE contacts SET phone = ${strippedPhone} WHERE id = ${contact.id}`;
            }
        }
        console.log("✅ Contacts cleaned successfully.");
        process.exit(0);
    } catch (e) {
        console.error("Error executing clean up:", e);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

main();
