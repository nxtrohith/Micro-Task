"use client";

import { useEffect, useState, useCallback } from "react";
import { PostIssue } from "@/components/post-issue";
import { IssueCard, type Issue } from "@/components/issue-card";
import { Loader2, Inbox, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5500").replace(/\/$/, "");

export default function FeedPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/issues`);
      if (!res.ok) throw new Error(`Failed to load issues (${res.status})`);
      const json = await res.json();
      setIssues(json.data ?? []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return (
    <div className="space-y-4">
      {/* Post issue form */}
      <PostIssue onSuccess={fetchIssues} />

      {/* Feed header */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-lg font-semibold">Community Issues</h1>
        <button
          onClick={fetchIssues}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 py-12 text-center dark:border-red-900/40 dark:bg-red-900/10">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchIssues}>
            Try again
          </Button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && issues.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-background py-16 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No issues reported yet.</p>
          <p className="text-xs text-muted-foreground/70">Be the first to report a civic issue!</p>
        </div>
      )}

      {/* Issues list */}
      {!loading && !error && issues.length > 0 && (
        <div className="space-y-3">
          {issues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
