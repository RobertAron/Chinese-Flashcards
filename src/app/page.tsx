import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col">
      <h1 className="text-4xl">Root</h1>
      <Link href="/challenge">Challenge</Link>
    </main>
  );
}
