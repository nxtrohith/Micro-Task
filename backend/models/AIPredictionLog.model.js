import mongoose from "mongoose";

const aiPredictionLogSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "Issue reference is required"],
      unique: true, // one prediction log per issue
    },
    modelVersion: {
      type: String,
      required: [true, "Model version is required"],
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
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  { timestamps: true }
);

// Pre-save: validate confidenceScore is between 0 and 1 if provided
aiPredictionLogSchema.pre("save", function (next) {
  if (
    this.confidenceScore != null &&
    (this.confidenceScore < 0 || this.confidenceScore > 1)
  ) {
    throw new Error("Confidence score must be between 0 and 1");
  }
  next();
});

const AIPredictionLog = mongoose.model(
  "AIPredictionLog",
  aiPredictionLogSchema
);
export default AIPredictionLog;
