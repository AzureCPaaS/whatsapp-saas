import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sql } from 'drizzle-orm';

async function main() {
    console.log("Applying multi-tenancy columns to Azure DB...");
    try {
        const { db } = await import('../src/db/index');
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number_id text;`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_token text;`);
        console.log("Migration complete!");
    } catch (e) {
        console.error("Migration failed:", e);
    }
    process.exit(0);
}
main();
