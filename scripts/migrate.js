import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function main() {
    console.log("Adding columns to users table...");
    try {
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number_id text`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_token text`;
        console.log("Migration successful!");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await sql.end();
    }
}
main();
