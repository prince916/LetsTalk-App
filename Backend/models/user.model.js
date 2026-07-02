import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    // confirmPassword: {type: String, required: true}
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

const User = mongoose.model("User", userSchema);

export default User;
