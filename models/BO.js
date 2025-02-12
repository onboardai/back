import mongoose from "mongoose";

const BOSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    method: {
      type: String,
      required: true,
    },
    businessInfo: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const BO = mongoose.model("businessOwners", BOSchema);

export default BO;
