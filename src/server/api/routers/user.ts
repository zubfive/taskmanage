import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { usersTable } from "@/server/db/schema";
import { eq, or } from "drizzle-orm";
import { lucia } from "@/server/auth";
import { cookies } from "next/headers";
import { hash, verify } from "@node-rs/argon2";
import { db } from "@/server/db";

export const userRouter = createTRPCRouter({
    registerUser: publicProcedure
    .input(
        z.object({
            name: z.string().min(1),
            email: z.string().email(),
            password: z.string().min(1),
        })
    )
    .mutation(async ({ input: { name, email, password }, ctx }) => {
        if (
            typeof password !== "string" ||
            password.length < 6 ||
            password.length > 255
        ) {
            return {
                error: "Invalid password"
            };
        }

        const result = await db
            .select({
                email: usersTable.email
            })
            .from(usersTable)
            .where(eq(usersTable.email, email));

        if (result.length > 0) {
            throw new Error("Email already exists");
        }

        const passwordHash = await hash(password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        });

        // Insert the new user into the database
        const insertedUser = await db.insert(usersTable).values({
            name,
            email: email == "" ? null : email,
            passwordHash,
        }).returning({
            id: usersTable.id,
            email: usersTable.email,
        });

        const user = insertedUser[0];

        if (!user) {
            throw new Error("Failed to register user");
        }

        // ✅ Login the user by creating a session
        const session = await lucia.createSession(user.id, {});

        // ✅ Create session cookie
        const sessionCookie = lucia.createSessionCookie(session.id);

        // ✅ Set session cookie
        (await cookies()).set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
        );

        // Return user details after successful login
        return { 
            success: true,
            user 
        };
    }),

    login: publicProcedure
    .input(
        z.object({
            email: z.string(),
            password: z.string().min(1),
        }),
    )
    .mutation(async ({ input: { email, password } ,ctx }) => {
        const response = await db
            .select({
                password: usersTable.passwordHash,
                id: usersTable.id,
                email: usersTable.email,
                category: usersTable.category,
            })
            .from(usersTable)
            .where(
                or(
                    eq(usersTable.email, email),
                )
            );

        const user = response[0];

        if (!user) {
            throw new Error("User not found");
        }
        if (!user.password) {
            throw new Error("Incorrect username or password");
        }

        const validPassword = await verify(user.password, password);
        if (!validPassword) {
            throw new Error("Incorrect username or password");
        }

        const session = await lucia.createSession(user.id, {});

        const sessionCookie = lucia.createSessionCookie(session.id);

        (await cookies()).set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
        );

        // Returning the category along with user data
        return { 
            user: {
                id: user.id,
                email: user.email,
                category: user.category
            } 
        };
    }),

    getUser: protectedProcedure.query(async ({ ctx }) => {
        // Use the select method instead of query.usersTable
        const users = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, ctx.user.id));
            
        return users[0] || null;
    }),
        
    logout: protectedProcedure.mutation(async ({ ctx }) => {
        await lucia.invalidateSession(ctx.session.id);
    
        const sessionCookie = lucia.createBlankSessionCookie();
    
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
    
        return {};
    }),
}); 