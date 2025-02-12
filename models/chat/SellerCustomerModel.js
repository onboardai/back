import mongoose from "mongoose";

const SellerCustomerSchema = new mongoose.Schema(
  {
    myId: {
      type: String,
      required: true,
    },
    myFriends: {
      type: Array,
      default: []
    },
  },
  { timestamps: true }
);

const SellerCustomer = mongoose.model("seller_customers", SellerCustomerSchema);

export default SellerCustomer;
