import { Suspense } from "react";
import { Skeleton } from "vocab-ui/Skeleton";
import DailyPartHome from "./client";

export default function Page() {
  return (
    // DailyPartHome reads useParams(), which is only known at runtime.
    <Suspense fallback={<DailyPartHomeSkeleton />}>
      <DailyPartHome />
    </Suspense>
  );
}

function DailyPartHomeSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="py-1">
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-12 w-1/2" />
      <Skeleton className="h-36 w-full" />
    </div>
  );
}
