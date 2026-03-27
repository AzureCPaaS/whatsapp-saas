import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const tokenResult = await db
            .select()
            .from(verificationTokens)
            .where(eq(verificationTokens.token, token))
            .limit(1);

        const dbToken = tokenResult[0];

        if (!dbToken || new Date(dbToken.expires) < new Date()) {
            return NextResponse.redirect(new URL("/login?error=VerificationFailed", request.url));
        }

        await db
            .update(users)
            .set({ emailVerified: new Date() })
            .where(eq(users.email, dbToken.identifier));

        await db
            .delete(verificationTokens)
            .where(eq(verificationTokens.token, token));

        return NextResponse.redirect(new URL("/login?verified=true", request.url));
    } catch (error) {
        console.error("API Verification error:", error);
        return NextResponse.redirect(new URL("/login?error=ServerError", request.url));
    }
}
