"use client";

// import { Pencil, Trash2, Eye } from "lucide-react";
import { api } from "@/trpc/react";
// import { useState } from "react";
// import { toast } from "react-hot-toast";

// type Task = {
//   id: string;
//   name: string;
//   title: string;
//   description: string;
//   status: "Pending" | "inProgress" | "Completed";
// };

export default function Dashboard() {
  const { data: tasks, isLoading, isError } = api.admin.getAllAdminTasks.useQuery();
//   const deleteMutation = api.admin.delete.useMutation();
 // For refreshing data after delete

  // Handle Delete
//   const handleDelete = async (taskId: string) => {
    // if (!confirm("Are you sure you want to delete this task?")) return;
    
    // try {
    //   await deleteMutation.mutateAsync({ id: taskId });
    //   toast.success("Task deleted successfully!");
    //   utils.admin.getAllTasks.invalidate(); // Refresh list
    // } catch (error) {
    //   toast.error("Failed to delete task.");
    // }
//   };

  // Handle View Task
//   const handleView = (task: Task) => {
//     alert(`Viewing Task: ${task.title}\nDescription: ${task.description}`);
//   };

  // Handle Edit Task (Placeholder)
//   const handleEdit = (task: Task) => {
//     alert(`Editing Task: ${task.title}`);
//     // Navigate to edit page or open modal
//   };

  if (isLoading) return <p className="text-center mt-10">Loading tasks...</p>;
  if (isError) return <p className="text-center text-red-500">Error loading tasks</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Task Dashboard</h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3 text-left">Task ID</th>
                <th className="border p-3 text-left">Name</th>
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
                  <td className="border p-3">{task.title}</td>
                  <td className="border p-3">{task.description}</td>
                  <td className="border p-3">{task.status}</td>
                  <td className="border p-3 flex justify-center space-x-2">
                    {/* <button
                      className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={}
                    >
                      <Eye size={18} />
                    </button> */}
                    {/* <button
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={}
                    >
                      <Pencil size={18} />
                    </button> */}
                    {/* <button
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={()}
                    >
                      <Trash2 size={18} />
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Badge UI for Task Status
// const getStatusBadge = (status: string) => {
//   const statusColors: Record<string, string> = {
//     Pending: "bg-yellow-500 text-white",
//     inProgress: "bg-blue-500 text-white",
//     Completed: "bg-green-500 text-white",
//   };

//   return (
//     <span className={`px-3 py-1 text-sm font-semibold rounded ${statusColors[status]}`}>
//       {status}
//     </span>
//   );
// };
