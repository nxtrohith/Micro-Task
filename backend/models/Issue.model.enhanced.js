/**
 * Mongoose Issue Model for Escalation System
 * 
 * This model enhances the existing Issue schema with escalation-related fields.
 * For MongoDB schema migration, add these fields to your issues collection:
 * 
 * db.issues.updateMany({}, {
 *   $set: {
 *     viewedByAdmin: false,
 *     escalationActive: false,
 *     lastReminderSent: null
 *   }
 * })
 */

import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    predictedIssueType: {
      type: String,
      trim: true,
    },
    severityScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    suggestedDepartment: {
      type: String,
      enum: [
        "Electrical",
        "Plumbing",
        "Civil",
        "Housekeeping",
        "Lift",
        "Security",
        "Other",
      ],
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["reported", "approved", "in_progress", "resolved"],
      default: "reported",
      index: true,
    },
    // ===== ESCALATION SYSTEM FIELDS =====
    viewedByAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    escalationActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastReminderSent: {
      type: Date,
      default: null,
    },
    // ===================================
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: upvoteCount derived from upvotes array length
issueSchema.virtual("upvoteCount").get(function () {
  return this.upvotes ? this.upvotes.length : 0;
});

// Virtual: priorityScore = severityScore + (upvotes.length * 0.5)
issueSchema.virtual("priorityScore").get(function () {
  const severity = this.severityScore || 0;
  const upvoteBonus = this.upvotes ? this.upvotes.length * 0.5 : 0;
  return severity + upvoteBonus;
});

// Virtual: isEligibleForEscalation
issueSchema.virtual("isEligibleForEscalation").get(function () {
  const hoursElapsed = (new Date() - this.createdAt) / (1000 * 60 * 60);
  return (
    this.severityScore >= 8 &&
    this.status === "reported" &&
    !this.viewedByAdmin &&
    hoursElapsed >= 72
  );
});

// Indexes
issueSchema.index({ status: 1 });
issueSchema.index({ severityScore: -1 });
issueSchema.index({ category: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ viewedByAdmin: 1, status: 1, severityScore: -1 }); // Compound index for escalation queries

// Pre-save: ensure severityScore exists before resolving
issueSchema.pre("save", function (next) {
  if (this.status === "resolved" && this.severityScore == null) {
    throw new Error("Cannot resolve an issue without a severity score");
  }
  next();
});

// Post-save: if admin views issue, stop escalation
issueSchema.post("save", async function (doc) {
  if (this.isModified("viewedByAdmin") && this.viewedByAdmin === true) {
    console.log(`[ESCALATION] Issue ${doc._id} viewed by admin - escalation will stop`);
  }
});

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;
