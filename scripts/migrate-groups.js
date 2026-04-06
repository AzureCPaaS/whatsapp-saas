import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function main() {
    console.log("Creating groups and contact_groups tables...");
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS groups (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                workspace_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name text NOT NULL,
                description text,
                created_at timestamp DEFAULT now() NOT NULL
            );
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS contact_groups (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
                group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
                assigned_at timestamp DEFAULT now() NOT NULL,
                UNIQUE(contact_id, group_id)
            );
        `;
        console.log("Migration successful!");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await sql.end();
    }
}
main();
