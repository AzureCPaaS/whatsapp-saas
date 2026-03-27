import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
}

const sql = postgres(dbUrl);
const db = drizzle(sql);

async function main() {
    try {
        const res = await db.execute(`SELECT * FROM verification_tokens WHERE identifier = 'fresh@azurecpaas.com'`);
        const token = res[0].token;
        console.log('EXTRACTED TOKEN:', token);

        const fetchRes = await fetch(`http://localhost:3000/api/verify-email?token=${token}`);
        console.log("API ENDPOINT REDIRECTED TO:", fetchRes.url);
    } catch (error) {
        console.error("Error fetching token:", error);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

main();
