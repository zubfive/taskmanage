"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { KeyRound, LogIn, UserPlus } from "lucide-react";

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
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
              <KeyRound size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
          </div>
          
          <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Please enter a valid email"
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition
                      ${errors.email ? "border-red-300" : "border-gray-300"}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password", { 
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition
                      ${errors.password ? "border-red-300" : "border-gray-300"}`}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="remember" className="ml-2 text-gray-600">Remember me</label>
                </div>
                <button type="button" className="text-indigo-600 hover:text-indigo-800">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition shadow-md"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LogIn size={18} className="mr-2" />
                    Sign In
                  </span>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button 
                  type="button"
                  onClick={() => router.push("/auth/signup")}
                  className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
                >
                  Create Account
                  <UserPlus size={16} className="ml-1" />
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block lg:w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')" }}>
        <div className="h-full w-full bg-black bg-opacity-20 flex items-center">
          <div className="px-20 max-w-xl">
            <h2 className="text-4xl font-bold text-white mb-6">Manage your tasks efficiently</h2>
            <p className="text-white text-lg">Our task management platform helps you organize your work and boost productivity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
