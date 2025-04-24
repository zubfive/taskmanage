"use client";
import { useRouter } from "next/navigation";
import React from "react";
// import { useToast } from "~/hooks/use-toast";
import { LogOut } from "lucide-react";
import { api } from "@/trpc/react";

interface LogoutButtonProps {
  variant?: "primary" | "ghost";
  className?: string;
  children?: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = "ghost", 
  className = "", 
  children 
}) => {
  const router = useRouter();

  const { mutate, isPending } = api.user.logout.useMutation({
    onSuccess() {
    //   toast({
    //     description: "Logged out successfully",
    //   });
      router.push("/");
    },
  });

  return (
    <button
      disabled={isPending}
      onClick={() => {
        mutate();
      }}
      className={`
        flex items-center transition
        ${variant === "primary" 
          ? "bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg" 
          : "text-gray-600 hover:text-indigo-600"
        }
        ${className}
      `}
    >
      {children || (
        <>
          <LogOut size={18} className="mr-2" />
          {isPending ? "Signing out..." : "Sign Out"}
        </>
      )}
    </button>
  );
};

export default LogoutButton;
