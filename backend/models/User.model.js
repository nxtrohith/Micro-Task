import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    houseNumber: {
      type: String,
      required: [true, "House number is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    role: {
      type: String,
      enum: ["resident", "admin"],
      default: "resident",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ role: 1 });

// Pre-save: enforce only ONE admin in the entire collection
userSchema.pre("save", async function (next) {
  if (this.role === "admin") {
    const existingAdmin = await mongoose.model("User").findOne({
      role: "admin",
      _id: { $ne: this._id },
    });
    if (existingAdmin) {
      throw new Error("Only one admin is allowed in the system");
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
