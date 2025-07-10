import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      {/* Main Stats Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex h-full w-full flex-col">
          <CardHeader>
            <CardTitle>Total time</CardTitle>
            <CardDescription>Total time in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 items-center justify-center">
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Instances</CardTitle>
            <CardDescription>
              Overview of instance status and activity.
            </CardDescription>
          </CardHeader>
          <CardDescription>
            <Skeleton className="mx-8 h-12" />
          </CardDescription>
        </Card>
      </div>

      {/* Activity Stats Skeleton */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                <Skeleton className="h-6 w-32" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="mt-1 h-4 w-48" />
              </CardDescription>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    </section>
  );
}
