import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import * as dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
    console.log('Seeding test user...');

    try {
        const passwordHash = await bcrypt.hash('Winstead28@11', 10);

        const [user] = await db.insert(schema.users).values({
            name: 'Test User',
            email: 'test@azurecpaas.com',
            password_hash: passwordHash,
            emailVerified: new Date(),
        })
            .onConflictDoUpdate({
                target: schema.users.email,
                set: {
                    password_hash: passwordHash,
                    name: 'Test User',
                    emailVerified: new Date(),
                }
            })
            .returning();

        console.log('Test user seeded successfully:', user);
    } catch (error: any) {
        console.error('Error seeding test user:', error);
    } finally {
        await client.end();
    }
}

main();
