import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-border bg-secondary-background fixed top-0 left-0 z-20 mx-auto flex h-[70px] w-full items-center border-b-4 px-5">
      <div className="text-foreground mx-auto flex w-[1300px] max-w-full items-center justify-between">
        <div className="flex items-center gap-10 xl:gap-10">
          <Link href={"/"}>
            <Image
              src="/images/wackanel.svg"
              height={32}
              width={32}
              alt="Wackanel Logo"
            />
          </Link>

          <div className="font-base hidden items-center gap-10 text-base lg:flex xl:gap-10">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/docs">Docs</Link>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          <Link href="/auth/login" className={buttonVariants()}>
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
