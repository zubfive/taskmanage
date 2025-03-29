"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Dashboard() {
  const { data: tasks, isLoading, isError, refetch } = api.admin.getAllAdminTasks.useQuery();
  const updateTaskMutation = api.admin.updateAdmin.useMutation();

  const router = useRouter();

  const deleteTask = api.task.delete.useMutation({
    onSuccess: async () => {
      alert("Task deleted successfully!");
      await refetch();
    },
    
  });

  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    id: "",
    title: "",
    description: "",
    status: "Pending",
  });

  if (isLoading) return <p className="text-center mt-10">Loading tasks...</p>;
  if (isError) return <p className="text-center text-red-500">Error loading tasks</p>;


  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate({ id });
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Task Dashboard</h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3 text-left">Task ID</th>
                <th className="border p-3 text-left">Title</th>
                <th className="border p-3 text-left">Description</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks?.map((task) => (
                <tr key={task.id} className="hover:bg-gray-100">
                  <td className="border p-3">{task.id}</td>
                  <td className="border p-3">{task.title}</td>
                  <td className="border p-3">{task.description}</td>
                  <td className="border p-3">{task.status}</td>
                  <td className="border p-3 flex justify-center space-x-2">

                    <button
                      onClick={() => handleDelete(task.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded p-6 shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Task</h2>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
              placeholder="Title"
            />
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
              placeholder="Description"
            ></textarea>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
            >
              <option value="Pending">Pending</option>
              <option value="inProgress">inProgress</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="flex justify-between">
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
