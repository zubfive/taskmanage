import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { taskmanager } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";

export const taskRouter = createTRPCRouter({
  create: protectedProcedure // Ensure only authenticated users can create tasks
  .input(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      priority: z.enum(["low", "medium", "high"]).default("high"),
      status: z.enum(["Pending", "inProgress", "Completed"]).default("Pending"),
      imageUrl: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // Insert the new task with the user's ID from the session
    const newTask = await ctx.db.insert(taskmanager).values({
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: input.status,
      userId: ctx.user.id, // Use the user ID directly from the context
      imageUrl: input.imageUrl,
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
        priority: z.enum(["low", "medium", "high"]).default("high"),
        status: z.enum(["Pending", "inProgress", "Completed"]).default("Pending"),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return db
        .update(taskmanager)
        .set({
          title: input.title,
          description: input.description,
          priority: input.priority,
          status: input.status,
          imageUrl: input.imageUrl,
        })
        .where(eq(taskmanager.id, input.id)); // Use eq() for filtering by ID
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return db.delete(taskmanager).where(eq(taskmanager.id, input.id)); // Use eq() for filtering
    }),
});

