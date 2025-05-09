import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { taskmanager } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";

export const adminRouter = createTRPCRouter({
  // Create a new task
  createAdmin: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        status: z.enum(["Pending", "inProgress", "Completed"]).default("Pending"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create the task with the user's ID
      const newTask = await db.insert(taskmanager).values({
        title: input.title,
        description: input.description,
        status: input.status,
        userId: ctx.user.id,
      }).returning();

      return newTask;
    }),

  // Get all tasks (Admin can see all tasks)
  getAllAdminTasks: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.select().from(taskmanager);
    }),

  // Update a task (Admin can update any task)
  updateAdmin: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        status: z.enum(["Pending", "inProgress", "Completed"]).default("Pending"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await db.update(taskmanager)
        .set({
          title: input.title,
          description: input.description,
          status: input.status,
        })
        .where(eq(taskmanager.id, input.id))
        .returning();
    }),

  // Delete a task (Admin can delete any task)
  deleteAdmin: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await db.delete(taskmanager).where(eq(taskmanager.id, input.id));
    }),
}); 