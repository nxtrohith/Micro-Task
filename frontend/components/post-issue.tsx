"use client";

import { useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { ImagePlus, X, ChevronDown, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LocationPicker, type PickedLocation } from "@/components/location-picker";
import { SpeechToTextButton } from "@/components/speech-to-text-button";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5500";

const CATEGORIES = [
  "Infrastructure",
  "Safety",
  "Sanitation",
  "Utilities",
  "Electrical",
  "Plumbing",
  "Other",
];

interface FormState {
  title: string;
  description: string;
  category: string;
  location: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  image?: string;
}

interface PostIssueProps {
  onSuccess?: () => void;
}

export function PostIssue({ onSuccess }: PostIssueProps) {
  const { getToken } = useAuth();

  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    category: "",
    location: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((e) => ({ ...e, [name]: undefined }));
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSubmitError("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Image must be under 5 MB.");
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setSubmitError(null);
  }

  function removeImage() {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.title.trim() || form.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters.";
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
    }
    if (!image) {
      newErrors.image = "A photo is required to submit an issue.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const token = await getToken();
      const body = new FormData();
      body.append("title", form.title.trim());
      body.append("description", form.description.trim());
      if (form.category) body.append("category", form.category);
      if (form.location) body.append("location", form.location.trim());
      if (image) body.append("image", image);

      // Attach GPS / map pin coordinates if available
      if (pickedLocation) {
        body.append("lat", pickedLocation.lat.toString());
        body.append("lng", pickedLocation.lng.toString());
        // Auto-fill location text from reverse-geocode if user left it blank
        if (!form.location && pickedLocation.address) {
          body.append("location", pickedLocation.address);
        }
      }

      const res = await fetch(`${BACKEND_URL}/api/issues`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Server error (${res.status})`);
      }

      // Reset
      setForm({ title: "", description: "", category: "", location: "" });
      removeImage();
      setPickedLocation(null);
      setExpanded(false);
      onSuccess?.();
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to submit issue. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setForm({ title: "", description: "", category: "", location: "" });
    removeImage();
    setPickedLocation(null);
    setErrors({});
    setSubmitError(null);
    setExpanded(false);
  }

  // Append STT transcript to description
  function handleTranscript(transcript: string) {
    setForm((f) => ({
      ...f,
      description: f.description
        ? `${f.description} ${transcript}`
        : transcript,
    }));
    if (errors.description) setErrors((e) => ({ ...e, description: undefined }));
  }

  return (
    <div className="rounded-xl border border-border/60 bg-background shadow-sm">
      {/* Collapsed trigger */}
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50 rounded-xl"
        >
          <div className="flex-1 rounded-full border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
            What issue would you like to report?
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <h2 className="text-base font-semibold">Report an Issue</h2>

          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Broken streetlight on Main St"
              className={cn(
                "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30",
                errors.title
                  ? "border-red-400 focus:ring-red-200"
                  : "border-border"
              )}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description + STT button */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>

            {/* STT controls row — language dropdown + mic button */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <span className="text-xs text-muted-foreground shrink-0">🎙️ Voice input:</span>
              <SpeechToTextButton
                onTranscript={handleTranscript}
                showLanguageSelector
              />
            </div>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the issue in detail… or use voice input above 🎙️"
              className={cn(
                "w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30",
                errors.description
                  ? "border-red-400 focus:ring-red-200"
                  : "border-border"
              )}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Category + Location text */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="location" className="text-sm font-medium">
                Location (text)
              </label>
              <input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Street, area, or landmark"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* ── Location Picker (GPS + Map Pin) ── */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <label className="text-sm font-medium">
                GPS Coordinates{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (optional — helps place issue on map)
                </span>
              </label>
            </div>
            <LocationPicker
              value={pickedLocation}
              onChange={setPickedLocation}
            />
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Photo <span className="text-red-500">*</span>
            </label>
            {imagePreview ? (
              <div className="relative w-full overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1 backdrop-blur-sm hover:bg-background transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-6 text-sm transition-colors hover:bg-muted/50",
                  errors.image
                    ? "border-red-400 text-red-500 hover:border-red-400"
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                <ImagePlus className="h-5 w-5" />
                Click to upload photo
              </button>
            )}
            {errors.image && (
              <p className="text-xs text-red-500">{errors.image}</p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {submitError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {submitError}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Submitting…" : "Submit Issue"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

