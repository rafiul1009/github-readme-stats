import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold">GitHub Readme Stats</h1>
      <p className="text-base text-neutral-500 max-w-md">
        A customizable widget generator for GitHub profile READMEs.
      </p>
      <Link
        href="/build"
        className="rounded-full bg-blue-600 text-white px-5 py-2 text-sm font-medium hover:bg-blue-700"
      >
        Open the builder
      </Link>
    </div>
  );
}
