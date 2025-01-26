export function Kbd({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex rounded-sm border border-black pb-[.05em] shadow-black/50 shadow-sm group-hocus:border-white">
      {/* bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 */}
      <kbd className="rounded-sm border-black border-b p-0.5 px-1 text-sm leading-[1em] group-hocus:border-white">
        {children}
      </kbd>
    </div>
  );
}
