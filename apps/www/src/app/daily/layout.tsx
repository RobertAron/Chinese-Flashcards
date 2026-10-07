// Not "navigation": dates generate on demand, and this keeps the skeleton fallback for them.
export const ensureStatic = "prefetch";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full grow flex-col px-3 pt-1 pb-3">{children}</div>;
}
