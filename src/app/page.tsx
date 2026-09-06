import { Studio } from "@/components/Studio";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-panel">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-brand">Token</span> Forge
          </h1>
          <p className="hidden text-sm text-muted sm:block">
            Design tokens studio with a built-in WCAG contrast audit
          </p>
        </div>
      </header>
      <Studio />
    </div>
  );
}
