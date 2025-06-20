"use client";
import { useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { LayoutGroup, motion } from "framer-motion";

import { ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import RotatingText from "@/components/ui/rotating-text";
import Star2 from "@/components/star/2";
import Star3 from "@/components/star/3";

export default function Hero() {
  const params = useSearchParams();

  useEffect(() => {
    setTimeout(() => {
      if (params.get("action") === "sign-out") {
        toast.info(
          <>
            You have been signed out. <br /> Please sign in again.
          </>,
        );
      }
    }, 1000);
  }, [params]);

  return (
    <section className="relative flex min-h-[100lvh] flex-col items-center justify-center overflow-hidden bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px] px-4 py-[100px] md:py-[200px]">
      <Star2
        color="var(--main)"
        stroke="black"
        strokeWidth={3}
        size={250}
        className="absolute top-[120px] -left-[125px] -z-10 hidden lg:block"
      />
      <Star3
        color="var(--main)"
        stroke="black"
        strokeWidth={3}
        size={250}
        className="absolute -right-[125px] bottom-[120px] -z-10 hidden lg:block"
      />
      <div className="container mx-auto max-w-full">
        <div className="relative flex flex-col items-center gap-4 text-center sm:gap-8">
          <header className="flex flex-col items-center text-center">
            <h1 className="z-10 inline-block text-2xl font-semibold sm:text-3xl md:text-5xl">
              Get creative by mirroring
            </h1>
            <LayoutGroup>
              <motion.h1
                className="flex items-center gap-3 text-2xl font-semibold sm:text-3xl md:text-5xl"
                layout
              >
                <motion.span
                  layout
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                >
                  your Wakatime
                </motion.span>
                <RotatingText
                  texts={["code.", "design.", "browse.", "debugging."]}
                  mainClassName="py-1 bg-main/50 border border-main px-2 rounded-lg"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2500}
                />
              </motion.h1>
            </LayoutGroup>
          </header>
          <p className="text-lg font-medium sm:text-xl md:text-3xl">
            Here comes the handy part; it&apos;s simple to use!
          </p>
          <Link href="/auth/sign-in" className={buttonVariants({ size: "lg" })}>
            Get Started
            <ArrowUpRight className="size-5 md:size-[30px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
