export function Kbd({ children }: { children?: React.ReactNode }) {
  return (
    <div className="hidden rounded-sm border border-black bg-white pb-[.05em] shadow-black/50 shadow-sm group-hocus:border-white group-pressed:border-white group-hocus:bg-black group-pressed:bg-black md:flex">
      <kbd className="no-underline! rounded-sm border-black border-b p-0.5 px-1.5 text-sm leading-[1em] group-hocus:border-white group-pressed:border-white">
        {children}
      </kbd>
    </div>
  );
}
