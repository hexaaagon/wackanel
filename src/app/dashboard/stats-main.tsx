import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function MainStats({
  totalActivity,
  newUser = false,
}: {
  totalActivity: number;
  newUser?: boolean;
}) {
  const hours = Math.floor(totalActivity / 60);
  const minutes = totalActivity % 60;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="flex h-full w-full flex-col">
        <CardHeader>
          <CardTitle>Total Activity</CardTitle>
          <CardDescription>Total activity in the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center text-2xl font-bold">
          {hours} {hours > 1 ? "hrs" : "hr"}{" "}
          {minutes > 0 ? `${minutes} min${minutes > 1 ? "s" : ""}` : ""}
        </CardContent>
        <CardFooter className="flex gap-4">
          {newUser && (
            <>
              <Link href="/dashboard/setup" className={buttonVariants()}>
                Setup
              </Link>
              <p className="text-muted-foreground text-xs">
                Get started by configuring
                <br /> your Wakatime.
              </p>
            </>
          )}
        </CardFooter>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Lorem ipsum</CardTitle>
          <CardDescription>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab nobis
          repellendus, amet excepturi velit numquam expedita aspernatur vel
          pariatur illo iure cumque? Aspernatur dolorum deleniti et neque natus
          animi nihil.
        </CardContent>
        <CardFooter className="flex flex-col justify-end"></CardFooter>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Lorem ipsum</CardTitle>
          <CardDescription>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab nobis
          repellendus, amet excepturi velit numquam expedita aspernatur vel
          pariatur illo iure cumque? Aspernatur dolorum deleniti et neque natus
          animi nihil.
        </CardContent>
        <CardFooter className="flex flex-col justify-end"></CardFooter>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Lorem ipsum</CardTitle>
          <CardDescription>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab nobis
          repellendus, amet excepturi velit numquam expedita aspernatur vel
          pariatur illo iure cumque? Aspernatur dolorum deleniti et neque natus
          animi nihil.
        </CardContent>
        <CardFooter className="flex flex-col justify-end"></CardFooter>
      </Card>
    </div>
  );
}
