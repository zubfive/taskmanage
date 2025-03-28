import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { taskmanager, usersTable } from "@/server/db/schema";
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
      // Fetch the user using the existing getUser logic
      const user = await db.query.usersTable.findFirst({
          where: eq(usersTable.id, ctx.user.id),
      });

      if (!user) {
          throw new Error("User not found");
      }

      // Insert the new task with the fetched userId
      const newTask = await db.insert(taskmanager).values({
          title: input.title,
          description: input.description,
          status: input.status,
          userId: user.id, // Using the user ID from getUser
      }).returning();

      return newTask;
  }),



  // Get all tasks (Admin can see all tasks)
  getAllAdminTasks: publicProcedure.query(async () => {
    return await db.select().from(taskmanager);
  }),

  // Get a single task by ID (for viewing details)
//   getTaskById: publicProcedure
//     .input(z.object({ id: z.string() }))
//     .query(async ({ input }) => {
//       return await db.select().from(taskmanager).where(eq(taskmanager.id, input.id));
//     }),

  // Update a task (Admin can edit any task)
  updateAdmin: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        status: z.enum(["Pending", "inProgress", "Completed"]).default("Pending"),
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
        .where(eq(taskmanager.id, input.id))
        .returning(); // Return updated task
    }),

  // Delete a task (Admin can delete any task)
  deleteAdmin: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return db.delete(taskmanager).where(eq(taskmanager.id, input.id));
    }),
});
