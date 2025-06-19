import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-border bg-secondary-background fixed top-0 left-0 z-20 mx-auto flex h-[70px] w-full items-center border-b-4 px-5">
      <div className="text-foreground mx-auto flex w-[1300px] max-w-full items-center text-center">
        {/* Left section */}
        <div className="flex flex-1 items-center justify-start">
          <Link href={"/"} className="flex items-center gap-1 font-semibold">
            <Image
              src="/images/wackanel.svg"
              height={42}
              width={42}
              alt="Wackanel Logo"
            />
            <p>Wackanel</p>
          </Link>
        </div>

        {/* Center section */}
        <div className="font-base hidden flex-1 items-center justify-center gap-5 text-base md:flex">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/docs">Docs</Link>
        </div>

        {/* Right section */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <Link href="/sign-in" className={buttonVariants()}>
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}
