"use client";
import Image from "next/image";
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

import { SiWakatime } from "@icons-pack/react-simple-icons";
import { authClient } from "@/lib/auth/client";

export default function AuthPage() {
  const handleSignIn = () => {
    const signInPromise = authClient.signIn.oauth2({
      providerId: "wakatime",
      callbackURL: "/dashboard",
    });

    toast.promise(signInPromise, {
      loading: "Signing in with Wakatime...",
      success: "Redirecting...",
      error: "Failed to sign in. Please try again.",
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
          <CardTitle className="text-xl">Sign in to your account</CardTitle>
          <CardDescription>
            To continue, please sign in with your Wakatime account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="neutral"
            className="w-full cursor-pointer"
            onClick={handleSignIn}
          >
            <SiWakatime /> Continue with Wakatime
          </Button>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div className="mt-4 text-center text-sm">
            By clicking continue, you agree to our <br />
            <a href="#" className="underline underline-offset-4">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4">
              Privacy Policy
            </a>
            .
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
