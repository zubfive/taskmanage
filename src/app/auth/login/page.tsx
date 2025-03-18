// "use client";
// import { redirect, useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// // import { useToast } from "~/hooks/use-toast";
// import { api } from "@/trpc/react";

// interface SignUpFormValues {
//   email: string;
//   password: string;
//   name: string;
// }

// export default function Login() {


//   const router = useRouter();
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<SignUpFormValues>();


// //   const { toast } = useToast();


//   const { mutate,  } = api.user.login.useMutation({
//     onSuccess: ({user}) => {
//       if ( user) router.push("/taskmanage");
//     },
//     onError: (error) => {
//     //   toast({
//     //         description: error.message
//     //     });
//     }
//   });

//   const onSubmit = (data: SignUpFormValues) => {
//     mutate(data);
//   };

//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="flex flex-col items-center gap-4 py-4"
//     >
//       <div className="flex flex-col text-2xl font-semibold">LogIn</div>
//       <div className="flex flex-col gap-4">
//         <input
//           type="text"
//           placeholder="Email"
//           {...register("email" )}
//           className="border border-gray-500 px-6 py-1"
//           required
//         />
//         {errors.email && (
//         <p className=" text-xs text-red-500">{errors.email.message}</p>
//       )}

//         <input
//           type="password"
//           placeholder="Password"
//           {...register("password")}
//           className="border border-gray-500 px-6 py-1"
//           required
//         />

//         {errors.password && (
//           <p className="text-xs text-red-500">{errors.password.message}</p>
//         )}
//       </div>
//       <div className="flex justify-between gap-6 text-sm">
//         <p className="cursor-pointer">Forgot Password?</p>

//         <p className="cursor-pointer" onClick={() => router.push("/auth/signup")}>
//           Create Account
//         </p>
//       </div>
//       <button className="bg-blue-400 px-4 py-2">Sign In</button>
//     </form>
//   );
// }
