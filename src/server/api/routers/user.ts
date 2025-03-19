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
            }),
        )
        .mutation(async ({ input: { name, email, password }}) => {
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


            // Insert user with hashed password
            await db.insert(usersTable).values({
                name,
                email: email == "" ? null : email,
               
                passwordHash,
            });


            return { success: true };
        }),


    login: publicProcedure
        .input(
            z.object({
                email: z.string(),
                password: z.string().min(1),
            }),
        )
        .mutation(async ({ input: { email, password } ,ctx }) => {

            console.log({
                host: ctx.host,
              });
        
            const response = await db
                .select({
                    // phoneNumber: usersTable.phoneNumber,
                    password: usersTable.passwordHash,
                    id: usersTable.id,
                    email: usersTable.email,
                })
                .from(usersTable)
                .where(
                    or(
                        eq(usersTable.email,email),
                        
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

            const session = await lucia.createSession(user.id, {
            });

            const sessionCookie = lucia.createSessionCookie(session.id);

            (await cookies()).set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes,
            );

            return { user };
        }),


        getUser: protectedProcedure.query(async ({ ctx }) => {
            const user = await db.query.usersTable.findFirst({
                where: eq(usersTable.id, ctx.user.id),
            });
    
            return user;
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