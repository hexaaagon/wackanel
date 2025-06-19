import { Toaster } from "@/components/ui/sonner";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
