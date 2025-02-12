import mongoose from "mongoose";

const AgentSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    shortInfo: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true
    },
    pricePerMonth: {
      type: Number,
      required: true,
    },
    pricePerHour: {
      type: String,
      required: true,
    },
    services: {
      type: Object,
      default: {},
    },
    benefits: {
      type: Object,
      default: {},
    },
    techs: {
      type: Object,
      default: {},
    },
    agencyName: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    department: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

AgentSchema.index({
  name: "text",
  department: "text",
  description: "text",
})

const Agent = mongoose.model("agents", AgentSchema);

export default Agent;
