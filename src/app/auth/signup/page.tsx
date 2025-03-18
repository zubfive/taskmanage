"use client";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";


interface SignUpFormValues {
  name: string;
  phoneNumber: string;
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

  const { mutate } = api.user.registerUser.useMutation({
    onSuccess: () => {
      alert("Account Created");
      router.push("/taskmanage");
    },
    onError: (error) => {
      
    },
  });

  const onSubmit = (data: SignUpFormValues) => {
    mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center gap-4 py-4"
    >
      <div className="flex flex-col text-2xl font-semibold">Sign Up</div>
      <div className="flex flex-col gap-4">
        <input
          type="name"
          {...register("name")}
          placeholder="Name"
          className="border border-gray-500 px-6 py-1"
          required
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
        
        <input
          type="email"
          placeholder="Email"
          {...register("email")}
          className="border border-gray-500 px-6 py-1"
          required
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
        <input
          placeholder="password"
          type="password"
          {...register("password")}
          className="border border-gray-500 px-6 py-1"
          required
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}{" "}
      </div>
      <div className="flex justify-between gap-6 text-sm">
        <p className="cursor-pointer" onClick={() => router.push("/")}>
          Have a account
        </p>
      </div>

      <button className="bg-blue-400 px-4 py-2">Submit</button>
    </form>
  );
}
