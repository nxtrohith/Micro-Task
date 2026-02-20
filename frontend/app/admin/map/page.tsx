import { Map } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminMapPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Map"
        subtitle="Civic issue geographic overview"
      />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
          {/* Styled placeholder container */}
          <div className="flex h-[60vh] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background shadow-sm">
            {/* Icon */}
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 shadow-sm">
              <Map className="h-12 w-12 text-blue-500 dark:text-blue-400 stroke-[1.3]" />
            </div>

            {/* Heading */}
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
              Map Feature
            </h2>

            {/* Subtitle */}
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground leading-relaxed">
              An interactive map showing all reported civic issues by location
              is currently under development.
            </p>

            {/* Badge */}
            <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-100 px-4 py-1.5 text-xs font-semibold text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
              Coming Soon
            </span>
          </div>

          {/* Planned features */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "Issue Pins",
                desc: "View all reported issues plotted on an interactive map.",
              },
              {
                title: "Cluster View",
                desc: "Automatically group nearby issues to identify hotspots.",
              },
              {
                title: "Filter by Layer",
                desc: "Toggle severity, department, or status overlays.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-background p-4 opacity-60"
              >
                <h4 className="text-sm font-semibold text-foreground">
                  {f.title}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
