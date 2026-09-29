import { BookOpenIcon } from "lucide-react";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { DailyChallengeLink } from "@/components/DailyChallengeLink";
import { cn } from "@/utils/cn";
import { Link } from "@/utils/NextNavigationUtils";

export default function Home() {
  return (
    <main className="flex w-full flex-col gap-6 px-3 py-6">
      <div>
        <p className="font-mono text-sm uppercase tracking-widest">中文 Flashcards</p>
        <h1 className="font-black text-5xl">Practice a little every day.</h1>
      </div>
      <section className="grid gap-2 md:grid-cols-2">
        <DailyChallengeLink />
        <Link
          href="/courses"
          className={cn(buttonBehaviorClasses, "flex min-h-48 flex-col justify-between rounded-lg p-5")}
        >
          <BookOpenIcon className="h-9 w-9" />
          <div>
            <h2 className="font-black text-3xl">Courses</h2>
            <p>Choose a lesson and practice at your own pace.</p>
          </div>
        </Link>
      </section>
    </main>
  );
}
