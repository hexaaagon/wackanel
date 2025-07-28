import { Suspense } from "react";
import Hero from "./hero";

export default function Home() {
  return (
    <main className="text-foreground font-base">
      <Suspense
        fallback={
          <div className="flex min-h-[100lvh] items-center justify-center">
            Loading...
          </div>
        }
      >
        <Hero />
      </Suspense>
    </main>
  );
}
