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
    // Insert the new task with the user's ID from the context
    try {
      // Create base values without imageUrl to handle case where column doesn't exist
      const baseValues = {
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: input.status,
        userId: ctx.user.id,
      };

      // If imageUrl is provided, include it in the values
      const values = input.imageUrl 
        ? { ...baseValues, imageUrl: input.imageUrl }
        : baseValues;

      const newTask = await ctx.db.insert(taskmanager).values(values).returning();
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      // If error contains "column imageUrl does not exist", try without imageUrl
      if (error instanceof Error && error.message.includes("column") && error.message.includes("does not exist")) {
        const newTask = await ctx.db.insert(taskmanager).values({
          title: input.title,
          description: input.description,
          priority: input.priority,
          status: input.status,
          userId: ctx.user.id,
        }).returning();
        return newTask;
      }
      throw error;
    }
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
      try {
        // Create base values without imageUrl
        const baseValues = {
          title: input.title,
          description: input.description,
          priority: input.priority,
          status: input.status,
        };

        // If imageUrl is provided, include it in the values
        const values = input.imageUrl 
          ? { ...baseValues, imageUrl: input.imageUrl }
          : baseValues;

        return db
          .update(taskmanager)
          .set(values)
          .where(eq(taskmanager.id, input.id));
      } catch (error) {
        console.error("Error updating task:", error);
        // If error contains "column imageUrl does not exist", try without imageUrl
        if (error instanceof Error && error.message.includes("column") && error.message.includes("does not exist")) {
          return db
            .update(taskmanager)
            .set({
              title: input.title,
              description: input.description,
              priority: input.priority,
              status: input.status,
            })
            .where(eq(taskmanager.id, input.id));
        }
        throw error;
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return db.delete(taskmanager).where(eq(taskmanager.id, input.id));
    }),
});

