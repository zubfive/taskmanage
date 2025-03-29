"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";

interface SignUpFormValues {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>();

  const { mutate, isPending } = api.user.login.useMutation({
    onSuccess: ({ user }) => {
      if (user) {
        if (user.category === "admin") {
          router.push("/dashboard"); // Redirect admins to dashboard
        } else if (user.category === "user") {
          router.push("/taskmanage"); // Redirect regular users to taskmanage
        }
      }
    },
  });
  

  const onSubmit = (data: SignUpFormValues) => {
    mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md shadow-lg rounded-xl bg-white p-6">
        <div className="text-center text-2xl font-semibold text-gray-800">Welcome Back</div>
        <p className="text-center text-gray-500 mb-4">Sign in to continue</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email", { required: "Email is required" })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <p className="cursor-pointer hover:text-blue-500">Forgot Password?</p>
            <p
              className="cursor-pointer hover:text-blue-500"
              onClick={() => router.push("/auth/signup")}
            >
              Create Account
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-red-800 hover:bg-black transition text-white py-2 rounded-lg"
            disabled={isPending}
          >
            {isPending ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
