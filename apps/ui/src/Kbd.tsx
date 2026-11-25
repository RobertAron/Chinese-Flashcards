import { cn } from "./cn";

/**
 * A keyboard shortcut hint. Hidden below the `md` breakpoint, where most visitors have no keyboard.
 * Inside a `group` element it turns black on hover, focus and press, to match `buttonBehaviorClasses`.
 */
export function Kbd({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "group-hocus:border-white group-pressed:border-white group-hocus:bg-black group-pressed:bg-black hidden rounded-sm border border-black bg-white pb-[.05em] shadow-sm shadow-black/50 md:flex",
        className,
      )}
    >
      <kbd className="group-hocus:border-white group-pressed:border-white rounded-sm border-b border-black p-0.5 px-1.5 text-sm leading-[1em] no-underline!">
        {children}
      </kbd>
    </div>
  );
}
