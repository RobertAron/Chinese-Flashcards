import { Button } from "@/components/Button";
import { Kbd } from "@/components/Kbd";
import { MotionLink } from "@/components/MotionLink";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { useKeyTrigger } from "@/utils/hooks";
import { useMergeClasses } from "@/utils/styleResolvers";
import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
export function ExitButton({ onExit }: { onExit: () => void }) {
  useKeyTrigger("Escape", onExit);
  return (
    <Button onClick={onExit} className="group flex gap-2 rounded-lg bg-white p-2">
      <Undo2 />
      <div>Exit</div>
      <div className="flex gap-1">
        <Kbd>esc</Kbd>
      </div>
    </Button>
  );
}

export function ExitLink({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  const router = useRouter();
  const navigate = useCallback(() => {
    router.push(href);
  }, [href, router]);
  useKeyTrigger("Escape", navigate);
  const coreExitButtonClasses = "flex gap-2 p-1";
  const combinedClassName = useMergeClasses(buttonBehaviorClasses, coreExitButtonClasses, className ?? "");
  return (
    <MotionLink href={href} className={combinedClassName}>
      <Undo2 className="flex-shrink-0" />
      <div>Exit</div>
      <div className="flex gap-1">
        <Kbd>esc</Kbd>
      </div>
    </MotionLink>
  );
}
