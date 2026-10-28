import { BookOpenIcon } from "lucide-react";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { DailyChallengeLink } from "@/components/DailyChallengeLink";
import { cn } from "@/utils/cn";
import { Link } from "@/utils/NextNavigationUtils";

export const ensureStatic = "navigation";

export default function Home() {
  return (
    <main className="flex w-full flex-col gap-6 px-3 py-6">
      <div>
        <p className="font-mono text-sm tracking-widest uppercase">中文 Flashcards</p>
        <h1 className="text-5xl font-black">Practice a little every day.</h1>
      </div>
      <section className="grid gap-2 md:grid-cols-2">
        <DailyChallengeLink />
        <Link
          href="/courses"
          className={cn(buttonBehaviorClasses, "flex min-h-48 flex-col justify-between rounded-lg p-5")}
        >
          <BookOpenIcon className="h-9 w-9" />
          <div>
            <h2 className="text-3xl font-black">Courses</h2>
            <p>Choose a lesson and practice at your own pace.</p>
          </div>
        </Link>
      </section>
    </main>
  );
}
