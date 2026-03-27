"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mail";

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    try {
        const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = userList[0];

        // Generic error to prevent email enumeration
        if (!user || !user.password_hash) {
            return { error: "Invalid email or password" };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return { error: "Invalid email or password" };
        }

        // Require email verification before login
        if (!user.emailVerified) {
            return { error: "Please verify your email address to log in." };
        }

        const cookieStore = await cookies();
        cookieStore.set("ws_session", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });
    } catch (error) {
        console.error("Login error:", error);
        return { error: "An unexpected error occurred" };
    }

    // Redirect must happen outside try/catch
    redirect("/dashboard");
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("ws_session");
    // Redirect must happen outside try/catch
    redirect("/login");
}

export async function signup(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "Name, email, and password are required" };
    }

    if (password.length < 8) {
        return { error: "Password must be at least 8 characters long" };
    }

    try {
        // Check if user already exists
        const existingUserList = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUserList.length > 0) {
            return { error: "An account with this email already exists" };
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create the user
        await db.insert(users).values({
            name,
            email,
            password_hash: passwordHash,
        });

        // Generate Verification Token
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await db.insert(verificationTokens).values({
            identifier: email,
            token,
            expires,
        });

        // Send Verification Email
        await sendVerificationEmail(email, token);

    } catch (error) {
        console.error("Signup error:", error);
        return { error: "An unexpected error occurred during signup." };
    }

    // Redirect must happen outside try/catch
    redirect("/verify-pending");
}
