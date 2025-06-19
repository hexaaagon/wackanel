"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { authClient } from "@/lib/auth/client";
import { LogOut, Trash } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();

  const handleSignOut = () => {
    const signOutPromise = authClient.signOut().then(() => {
      router.push("/");
    });

    toast.promise(signOutPromise, {
      loading: "Signing out...",
      success: "Successfully signed out! Redirecting to home...",
      error: "Failed to sign out. Please try again.",
    });
  };

  return (
    <main className="bg-secondary-background relative flex min-h-[100lvh] flex-col items-center justify-center gap-2 overflow-hidden bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px] px-4 py-[100px] md:py-[200px]">
      <div className="flex items-center justify-center">
        <Image
          src="/images/wackanel.svg"
          height={48}
          width={48}
          alt="Wackanel Logo"
        />
        <h1 className="ml-2 text-2xl font-semibold">Wackanel</h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Dashboard</CardTitle>
          <CardDescription>
            Under construction. This page will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            variant="neutral"
            className="w-full cursor-pointer bg-red-500 hover:bg-red-600"
            onClick={handleSignOut}
          >
            <LogOut /> Sign Out
          </Button>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </main>
  );
}
