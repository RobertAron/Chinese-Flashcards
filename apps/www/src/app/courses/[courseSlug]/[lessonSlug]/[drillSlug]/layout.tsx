import { Suspense } from "react";
import { AppServerLayoutEntrypoint } from "@/components/AppPage";
import { getDrillInfo } from "@/components/challenges/challengeServerUtils";
import { DrillProvider } from "@/components/challenges/DrillProvider";
import { Skeleton } from "@/components/Skeleton";
import { paramsTemplate } from "./paramsTemplate";

export default AppServerLayoutEntrypoint(({ children, params }) => {
  return (
    <Suspense fallback={<DrillSkeleton />}>
      <DrillData params={params}>{children}</DrillData>
    </Suspense>
  );
});

async function DrillData({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Record<string, unknown>>;
}) {
  const parsedParams = paramsTemplate.parse(await params);
  const challengeData = await getDrillInfo(parsedParams);
  return (
    <DrillProvider
      {...parsedParams}
      {...challengeData}
      homeHref={`/courses/${parsedParams.courseSlug}/${parsedParams.lessonSlug}/${parsedParams.drillSlug}`}
    >
      {children}
    </DrillProvider>
  );
}

function DrillSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="py-2">
        <Skeleton className="h-6 w-64" />
      </div>
      <Skeleton className="h-12 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
