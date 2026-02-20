const mongoose = require("mongoose");

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
      type: String, // Cloudinary URL stored as a plain string
      trim: true,
    },
    predictedIssueType:{
      type: String,
      trim: true,
    },
    severityScore: {
      type: Number,
      min: 0,
      max: 10,
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
    },
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

// Indexes
issueSchema.index({ status: 1 });
issueSchema.index({ severityScore: -1 });
issueSchema.index({ createdAt: -1 });

// Pre-save: if status is set to "resolved", ensure severityScore exists
issueSchema.pre("save", function (next) {
  if (this.status === "resolved" && (this.severityScore == null)) {
    throw new Error(
      "Cannot resolve an issue without a severity score"
    );
  }
  next();
});

const Issue = mongoose.model("Issue", issueSchema);
module.exports = Issue;
