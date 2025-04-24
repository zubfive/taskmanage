"use client";

import { api } from "@/trpc/react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { redirect } from "next/navigation";
import { PlusCircle, Edit, Trash2, CheckCircle, Clock, ArrowUpCircle, XCircle, ListFilter, ImageIcon } from "lucide-react";
import { uploadToBackblaze } from "@/lib/backblaze";

type Task = {
  id: string;
  title: string | null;
  description: string;
  priority: "low" | "medium" | "high" | null;
  status: "Pending" | "inProgress" | "Completed" | null;
  createdAt: Date;
  imageUrl?: string | null;
};

type TaskFormData = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "Pending" | "inProgress" | "Completed";
  imageUrl?: string;
};

export default function TaskForm() {
  const { register, handleSubmit, reset, setValue } = useForm<TaskFormData>();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const use = api.user.getUser.useQuery();

  if (!use) {
    redirect("/");
  }
  
  const { data: tasks, refetch, isLoading } = api.task.getAllTask.useQuery();

  // Create task mutation
  const createTask = api.task.create.useMutation({
    onSuccess: async () => {
      reset();
      await refetch();
    },
  });

  // Update task mutation
  const updateTask = api.task.update.useMutation({
    onSuccess: async () => {
      setEditingTaskId(null);
      reset();
      await refetch();
    },
  });

  // Delete task mutation
  const deleteTask = api.task.delete.useMutation({
    onSuccess: async () => {
      await refetch();
    },
  });

  // Handle form submission
  const onSubmit = async (data: TaskFormData) => {
    if (editingTaskId) {
      updateTask.mutate({
        id: editingTaskId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        imageUrl: data.imageUrl
      });
    } else {
      try {
        setIsUploading(true);
        let imageUrl: string | undefined = undefined;
        
        if (selectedImage) {
          imageUrl = await uploadToBackblaze(selectedImage);
        }

        createTask.mutate({
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          imageUrl: imageUrl
        });
        
        setSelectedImage(null);
        setImagePreview(null);
        reset();
        setIsUploading(false);
      } catch (error) {
        console.error("Error creating task:", error);
        setIsUploading(false);
      }
    }
  };

  // Handle edit click
  const handleEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setValue("title", task.title ?? "");
    setValue("description", task.description);
    setValue("priority", task.priority ?? "low");
    setValue("status", task.status ?? "Pending");
  };
  
  // Handle delete click
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate({ id });
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string | null }) => {
    switch(status) {
      case "Completed":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1 dark:bg-green-900 dark:text-green-100"><CheckCircle size={14} /> Completed</span>;
      case "inProgress":
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1 dark:bg-blue-900 dark:text-blue-100"><ArrowUpCircle size={14} /> In Progress</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1 dark:bg-yellow-900 dark:text-yellow-100"><Clock size={14} /> Pending</span>;
    }
  };
  
  // Filter tasks
  const filteredTasks = tasks?.filter(task => {
    if (activeFilter === "all") return true;
    return task.status === activeFilter;
  });

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center dark:text-gray-100">Task Manager</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Form */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center dark:text-gray-100">
              <PlusCircle className="mr-2 text-indigo-500" size={20} />
              {editingTaskId ? "Edit Task" : "Add New Task"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Title</label>
                <input
                  {...register("title")}
                  type="text"
                  className="input"
                  placeholder="What needs to be done?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Description</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="input"
                  placeholder="Add some details about this task..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Status</label>
                <select
                  {...register("status")}
                  className="input"
                >
                  <option value="Pending">Pending</option>
                  <option value="inProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Priority</label>
                <select
                  {...register("priority")}
                  className="input"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Task Image</label>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 flex items-center"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Choose Image
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-10 w-10 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn btn-primary w-full py-2 px-4"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </div>
                  ) : editingTaskId ? (
                    <>
                      <Edit size={18} className="mr-2" />
                      Update Task
                    </>
                  ) : (
                    <>
                      <PlusCircle size={18} className="mr-2" />
                      Add Task
                    </>
                  )}
                </button>
                {editingTaskId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTaskId(null);
                      reset();
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="btn btn-outline w-full mt-2 py-2 px-4"
                  >
                    <XCircle size={18} className="mr-2" />
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Task List */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center dark:text-gray-100">
                <ListFilter className="mr-2 text-indigo-500" size={20} />
                My Tasks
              </h2>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setActiveFilter("all")}
                  className={`btn px-3 py-1 text-sm rounded-md ${activeFilter === "all" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setActiveFilter("Pending")}
                  className={`btn px-3 py-1 text-sm rounded-md ${activeFilter === "Pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}
                >
                  Pending
                </button>
                <button 
                  onClick={() => setActiveFilter("inProgress")}
                  className={`btn px-3 py-1 text-sm rounded-md ${activeFilter === "inProgress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}
                >
                  In Progress
                </button>
                <button 
                  onClick={() => setActiveFilter("Completed")}
                  className={`btn px-3 py-1 text-sm rounded-md ${activeFilter === "Completed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}
                >
                  Completed
                </button>
              </div>
            </div>

            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {!isLoading && filteredTasks?.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-lg">No tasks found</p>
                <p className="text-sm">Add a new task to get started</p>
              </div>
            )}

            <div className="space-y-3">
              {filteredTasks?.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-4 rounded-lg border transition ${
                    task.status === "Completed" ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : 
                    task.status === "inProgress" ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20" : 
                    "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-100">{task.title ?? "Untitled"}</h3>
                      <p className="text-gray-600 mt-1 text-sm dark:text-gray-300">{task.description}</p>
                      <p className="text-gray-600 mt-1 text-sm dark:text-gray-300">{task.priority}</p>
                      <div className="mt-2">
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-indigo-900 dark:hover:text-indigo-300"
                        title="Edit task"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-red-900 dark:hover:text-red-300"
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Image display */}
                  {task.imageUrl && (
                    <div className="mt-3">
                      <img 
                        src={task.imageUrl} 
                        alt={`Task: ${task.title}`}
                        className="w-full h-48 object-cover rounded-md" 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
