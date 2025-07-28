import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import InstancesChart from "@/components/app/instances-chart";
import { useInstanceStatus } from "@/lib/app/hooks/useInstanceStatus";
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

  const { status: instanceStatus, isLoading: instancesLoading } =
    useInstanceStatus();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="flex h-full w-full flex-col">
        <CardHeader>
          <CardTitle>Total time</CardTitle>
          <CardDescription>Total time in the last 24 hours</CardDescription>
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

      {instancesLoading ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Instances</CardTitle>
            <CardDescription>
              Overview of instance status and activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="mx-8 h-12" />
          </CardContent>
        </Card>
      ) : (
        <InstancesChart
          onlineCount={instanceStatus.onlineCount}
          offlineCount={instanceStatus.offlineCount}
        />
      )}
    </div>
  );
}
