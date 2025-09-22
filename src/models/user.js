import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Additional Details
  companyName: String,
  contactPerson: String,
  gstNumber: String,
  panNumber: String,

  // Billing
  billingAddress: String,
  billingCity: String,
  billingZip: String,
  billingCountry: String,
  billingPhone: String,

  // Shipping
  shippingAddress: String,
  shippingCity: String,
  shippingZip: String,
  shippingCountry: String,
  shippingPhone: String,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
