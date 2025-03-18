"use client";

import { api } from "@/trpc/react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { redirect } from 'next/navigation';
import LogoutButton from "@/app/_components/logout";


type Task = {
  id: string;
  title: string;
  description: string;
  status: "Pending" | "Approved";
};

type TaskFormData = Omit<Task, "id">;

export default function TaskForm() {


  const { register, handleSubmit, reset, setValue } = useForm<TaskFormData>();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Fetch all tasks
  const { data: tasks, refetch, isLoading } = api.task.getAllTask.useQuery();

  // Create task mutation
  const createTask = api.task.create.useMutation({
    onSuccess: async () => {
      alert("Task added successfully!");
      reset();
      await refetch();
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Update task mutation
  const updateTask = api.task.update.useMutation({
    onSuccess: async () => {
      alert("Task updated successfully!");
      setEditingTaskId(null);
      reset();
      await refetch();
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Delete task mutation
  const deleteTask = api.task.delete.useMutation({
    onSuccess: async () => {
      alert("Task deleted successfully!");
      await refetch();
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Handle form submission
  const onSubmit = (data: TaskFormData) => {
    if (editingTaskId) {
      updateTask.mutate({ id: editingTaskId, ...data });
    } else {
      createTask.mutate(data);
    }
  };

  // Handle edit click
  const handleEdit = (task: {
    id: string;
    title: string | null;
    description: string;
    status: "Pending" | "Approved" | null;
    createdAt: Date;
  }) => {
    setEditingTaskId(task.id);
    setValue("title", task.title ?? ""); // Default to empty string if null
    setValue("description", task.description);
    setValue("status", task.status ?? "Pending"); // Default to "Pending" if null
  };
  
  // Handle delete click
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate({ id });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
 <div className="w-full flex justify-end pb-4 pr-4 bg-white shadow-md">
        <div className="">
          <LogoutButton/>
        </div>
      </div>
      {/* Task Form */}
      <div className="bg-white p-6 rounded-lg shadow-md w-96 mb-6 mt-20">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {editingTaskId ? "Edit Task" : "Add Task"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              {...register("title")}
              type="text"
              className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-200"
              placeholder="Enter title"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register("description")}
              className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-200"
              placeholder="Enter description"
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              {...register("status")}
              className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-200"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-[#A20707] text-white p-2 rounded-md hover:bg-blue-600"
          >
            {editingTaskId ? "Update Task" : "Add Task"}
          </button>
          {editingTaskId && (
            <button
              type="button"
              onClick={() => {
                setEditingTaskId(null);
                reset();
              }}
              className="w-full bg-gray-500 text-white p-2 rounded-md mt-2"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4 text-center">Task List</h2>

        {isLoading && <p className="text-center text-gray-500">Loading...</p>}
        {tasks?.length === 0 && <p className="text-center text-gray-500">No tasks found.</p>}

        <ul className="divide-y divide-gray-200">
        {tasks?.map((task) => (
  <li key={task.id} className="py-4 flex justify-between items-center">
    <div>
      <p><strong>Title:</strong> {task.title ?? "Untitled"}</p>
      <p><strong>Description:</strong> {task.description}</p>
      <p><strong>Status:</strong> {task.status ?? "Pending"}</p>
    </div>
    <div className="flex space-x-2">
      <button
        onClick={() => handleEdit(task)}
        className="bg-red-300 text-white px-2 py-1 rounded-md"
      >
        🖋️
      </button>
      <button
        onClick={() => handleDelete(task.id)}
        className="bg-lime-600 text-white px-2 py-1 rounded-md"
      >
        🗑️
      </button>
    </div>
  </li>
))}

        </ul>
      </div>
    </div>
  );
}
