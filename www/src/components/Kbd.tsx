export function Kbd({ children }: { children?: React.ReactNode }) {
  return (
    <div className="group-hocus:border-white flex rounded-sm border border-black pb-[.05em] shadow-sm shadow-black/50">
      {/* bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 */}
      <kbd className="group-hocus:border-white rounded-sm border-b border-black p-0.5 px-1 text-sm leading-[1em]">
        {children}
      </kbd>
    </div>
  );
}
