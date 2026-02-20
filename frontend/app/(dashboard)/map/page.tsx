import { Map } from "lucide-react";

export default function MapPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex h-[60vh] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-background text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <Map className="h-10 w-10 text-muted-foreground/60 stroke-[1.2]" />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">
          Map Feature
        </h2>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Map feature is under development. Soon you&apos;ll be able to view and
          report civic issues directly on an interactive map.
        </p>
        <span className="mt-4 inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
