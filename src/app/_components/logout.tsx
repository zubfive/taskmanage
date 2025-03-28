"use client";
import { useRouter } from "next/navigation";
import React from "react";
// import { useToast } from "~/hooks/use-toast";
import { api } from "@/trpc/react";

const LogoutButton = () => {
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
      className="mt-10 bg-blue-400 px-4 py-2"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
