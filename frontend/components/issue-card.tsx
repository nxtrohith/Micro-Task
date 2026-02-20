"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "@/lib/time";
import { cn } from "@/lib/utils";
import { MapPin, Tag, ChevronUp, Loader2, MessageSquare, User } from "lucide-react";
import { CommentsSection } from "@/components/comments-section";
import { ImageLightbox, ExpandHint } from "@/components/image-lightbox";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5500").replace(/\/$/, "");

export interface Issue {
  _id: string;
  title: string;
  description: string;
  location?: string;
  imageUrl?: string;
  category?: string;
  status: "reported" | "approved" | "in_progress" | "resolved";
  upvotes: string[];
  reportedBy?: string;
  reporterName?: string;
  reporterImage?: string;
  createdAt: string;
  coordinates?: { lat: number; lng: number };
}

const STATUS_STYLES: Record<Issue["status"], string> = {
  reported: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const STATUS_LABELS: Record<Issue["status"], string> = {
  reported: "Reported",
  approved: "Approved",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export function IssueCard({ issue }: { issue: Issue }) {
  const { userId, getToken } = useAuth();

  const [upvoteCount, setUpvoteCount] = useState(issue.upvotes?.length ?? 0);
  const [hasUpvoted, setHasUpvoted] = useState(
    !!userId && Array.isArray(issue.upvotes) && issue.upvotes.includes(userId)
  );
  const [pending, setPending] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  async function handleUpvote() {
    if (!userId || pending) return;
    const next = !hasUpvoted;
    setHasUpvoted(next);
    setUpvoteCount((c) => c + (next ? 1 : -1));
    setPending(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/api/issues/${issue._id}/upvote`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setUpvoteCount(json.data.upvoteCount);
      setHasUpvoted(json.data.hasUpvoted);
    } catch {
      setHasUpvoted(!next);
      setUpvoteCount((c) => c + (next ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  const reporterName = issue.reporterName || "Anonymous";

  return (
    <article className="group rounded-xl border border-border/60 bg-background shadow-sm transition-shadow hover:shadow-md">
      <div className="p-5">
        {/* Reporter row */}
        <div className="flex items-center gap-2 mb-3">
          {issue.reporterImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={issue.reporterImage}
              alt={reporterName}
              className="h-7 w-7 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted border border-border">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
          <span className="text-xs font-medium text-foreground">{reporterName}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{formatDistanceToNow(issue.createdAt)}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug text-foreground line-clamp-2">
            {issue.title}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
              STATUS_STYLES[issue.status]
            )}
          >
            {STATUS_LABELS[issue.status]}
          </span>
        </div>

        {/* Description */}
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
          {issue.description}
        </p>

        {/* Optional image — click to open lightbox */}
        {issue.imageUrl && (
          <div className="mt-3 overflow-hidden rounded-lg border border-border/40">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="group/img relative block w-full cursor-zoom-in"
              aria-label="View fullscreen"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="h-48 w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
              <ExpandHint />
            </button>
          </div>
        )}

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {issue.category && (
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {issue.category}
            </span>
          )}
          {issue.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {issue.location}
            </span>
          )}

          <div className="ml-auto flex items-center gap-2">
            {/* Comments toggle */}
            <button
              onClick={() => setShowComments((o) => !o)}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition-colors",
                showComments
                  ? "bg-muted text-foreground"
                  : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="h-3 w-3" />
              Comments
            </button>

            {/* Upvote button */}
            <button
              onClick={handleUpvote}
              disabled={!userId || pending}
              title={userId ? (hasUpvoted ? "Remove upvote" : "Upvote") : "Sign in to upvote"}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition-colors",
                hasUpvoted
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-primary/10 hover:text-primary",
                (!userId || pending) && "opacity-60 cursor-not-allowed"
              )}
            >
              {pending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}
              {upvoteCount}
            </button>
          </div>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-border/60 px-5 py-4">
          <CommentsSection issueId={issue._id} />
        </div>
      )}

      {/* Fullscreen image lightbox */}
      {lightboxOpen && issue.imageUrl && (
        <ImageLightbox
          src={issue.imageUrl}
          alt={issue.title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </article>
  );
}
