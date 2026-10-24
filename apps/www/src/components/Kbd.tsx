export function Kbd({ children }: { children?: React.ReactNode }) {
  return (
    <div className="group-hocus:border-white group-pressed:border-white group-hocus:bg-black group-pressed:bg-black hidden rounded-sm border border-black bg-white pb-[.05em] shadow-sm shadow-black/50 md:flex">
      <kbd className="group-hocus:border-white group-pressed:border-white rounded-sm border-b border-black p-0.5 px-1.5 text-sm leading-[1em] no-underline!">
        {children}
      </kbd>
    </div>
  );
}
