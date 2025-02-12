import mongoose from "mongoose";

const SellerCustomerMessageSchema = new mongoose.Schema(
  {
    senderName: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "unseen",
    },
  },
  { timestamps: true }
);

const SellerCustomerMessage = mongoose.model(
  "seller_customers_msg",
  SellerCustomerMessageSchema
);

export default SellerCustomerMessage;
