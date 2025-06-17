import Image from "next/image";

export default function Home() {
  return (
    <main className="text-foreground font-base">
      <section className="relative flex min-h-[100lvh] flex-col items-center justify-center bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px] py-[100px] md:py-[200px]">
        <div className="container mx-auto max-w-full">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-5xl">Hello World.</h1>
          </div>
        </div>
      </section>
    </main>
  );
}
