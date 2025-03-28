import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { taskmanager, usersTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";

export const taskRouter = createTRPCRouter({


  create: protectedProcedure // Ensure only authenticated users can create tasks
  .input(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      status: z.enum(["Pending", "inProgress", "Completed"]).default("Pending"),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // Fetch the authenticated user's ID
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, ctx.user.id),
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Insert the new task with the fetched userId
    const newTask = await ctx.db.insert(taskmanager).values({
      title: input.title,
      description: input.description,
      status: input.status,
      userId: user.id, // Assign the task to the current user
    }).returning();

    return newTask;
  }),


    getAllTask: protectedProcedure.query(async ({ ctx }) => {
      return await ctx.db
        .select()
        .from(taskmanager)
        .where(eq(taskmanager.userId, ctx.user.id));
    }),

      update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          status: z.enum(["Pending", "inProgress" , "Completed"]).default("Pending"),
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

   

