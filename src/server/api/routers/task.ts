import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { taskmanager } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";

export const taskRouter = createTRPCRouter({
    create: publicProcedure
    .input( // 1️⃣ Input validation
        z.object({
          title: z.string().min(1), // Name field
          description: z.string().min(1), // Description field
          status: z.enum(["Pending", "Approved"]).default("Pending"),  // Baigan field
        })
      )
      .mutation(async ({ ctx, input }) => {// 2️⃣ Mutation function
        const newTask = await ctx.db.insert(taskmanager).values({// 3️⃣ Insert data into the databas
          title: input.title,
          description: input.description,
          status: input.status,
        }).returning(); // Returns the inserted row
    
        return newTask; // Send it back to the client
      }),

      getAllTask: publicProcedure.query(async ({ ctx }) => {
        return await ctx.db.select().from(taskmanager)
      }),

      update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          status: z.enum(["Pending", "Approved"]).default("Pending"),
        })
      )
      .mutation(async ({ input }) => {
        return db
          .update(taskmanager)
          .set({
            title: input.title,
            description: input.description,
            status: input.status,
          })
          .where(eq(taskmanager.id, input.id)); // Use eq() for filtering by ID
      }),

      delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return db.delete(taskmanager).where(eq(taskmanager.id, input.id)); // Use eq() for filtering
      }),


    });

   

