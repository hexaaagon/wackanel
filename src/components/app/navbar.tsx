"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthData } from "@/lib/store/hooks";

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuthData();

  return (
    <nav className="border-border bg-secondary-background fixed top-0 left-0 z-20 mx-auto flex h-[70px] w-full items-center border-b-4 px-5">
      <div className="text-foreground mx-auto flex w-[1300px] max-w-full items-center text-center">
        {/* Left section */}
        <div className="flex flex-1 items-center justify-start">
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-1 font-semibold"
          >
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
          {isLoading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300"></div>
          ) : isAuthenticated && user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={user.image || "/images/default-avatar.png"}
                      alt={`${user.name}'s Avatar ` || "User Avatar"}
                    />
                    <AvatarFallback>
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="text-xs">
                          <Settings />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="text-xs">
                          <Settings /> Settings
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/auth/sign-out" className="text-xs">
                        <LogOut /> Sign Out
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth/sign-in" className={buttonVariants()}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
