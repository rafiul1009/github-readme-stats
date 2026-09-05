export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold">GitHub Readme Stats</h1>
      <p className="text-base text-neutral-500 max-w-md">
        A customizable widget generator for GitHub profile READMEs. The interactive
        builder is coming soon — for now, the streak widget is available at{" "}
        <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded">
          /api/widget/streak?username=&lt;login&gt;
        </code>
        .
      </p>
    </div>
  );
}
