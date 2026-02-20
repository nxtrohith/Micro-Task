"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Loader2, AlertCircle, RefreshCw, MapPin } from "lucide-react";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { AdminHeader } from "@/components/admin/admin-header";
import type { AdminIssue } from "@/components/admin/issue-edit-modal";
import { cn } from "@/lib/utils";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5500";

const IssueMap = dynamic(
  () => import("@/components/map/issue-map").then((m) => m.IssueMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted/40 rounded-xl">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

const STATUS_LEGEND = [
  { color: "#ef4444", label: "Reported / Open" },
  { color: "#f97316", label: "In Progress / Approved" },
  { color: "#22c55e", label: "Resolved" },
  { color: "#3b82f6", label: "Your Location" },
];

export default function AdminMapPage() {
  const [issues, setIssues] = useState<AdminIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  const { status: geoStatus, coords, error: geoError, requestLocation } = useGeolocation();

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/issues`);
      if (!res.ok) throw new Error(`Failed to load issues (${res.status})`);
      const json = await res.json();
      setIssues(json.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
    requestLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = filterStatus
    ? issues.filter((i) => i.status === filterStatus)
    : issues;

  const withCoords = filtered.filter((i) => i.coordinates);
  const total = issues.filter((i) => i.coordinates).length;

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Map"
        subtitle={`${total} geotagged issue${total !== 1 ? "s" : ""}`}
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <button
            onClick={() => { fetchIssues(); requestLocation(); }}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>

          <span className="text-xs text-muted-foreground ml-auto">
            Showing {withCoords.length} of {filtered.length} issue{filtered.length !== 1 ? "s" : ""} with GPS
          </span>
        </div>

        {/* Geo status */}
        {geoStatus === "loading" && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-2.5 text-xs text-blue-700 dark:text-blue-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Detecting your location…
          </div>
        )}
        {geoStatus === "success" && coords && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 px-4 py-2 text-xs text-green-700 dark:text-green-400">
            <MapPin className="h-3.5 w-3.5" />
            Location detected — centered on your position
          </div>
        )}
        {(geoStatus === "denied" || geoStatus === "unavailable" || geoStatus === "timeout" || geoStatus === "error") && (
          <div className="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 px-4 py-2.5 text-xs text-orange-700 dark:text-orange-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {geoError}
            <button onClick={requestLocation} className="ml-auto underline">Retry</button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={fetchIssues} className="ml-auto text-xs underline">Retry</button>
          </div>
        )}

        {/* Map */}
        <div className="relative h-[65vh] min-h-[400px] rounded-xl border border-border overflow-hidden shadow-sm">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <IssueMap
            issues={filtered}
            userLocation={geoStatus === "success" ? coords : null}
            height="100%"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-background px-5 py-3">
          <span className="text-xs font-medium text-muted-foreground mr-1">Legend:</span>
          {STATUS_LEGEND.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-full border border-white shadow-sm"
                style={{ background: color }}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

