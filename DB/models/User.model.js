import { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";
import cryptojs from "crypto-js";
const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    age: String,
    confirmEmail: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    image: Object,
    coverImages: [{ type: Object }],
    code: String,
    expireCodeDuration: Date
  },
  {
    timestamps: true,
  }
);

// hashing password , encryption phone and split userName (before storing any data in DB)
userSchema.pre("save", function () {
  this.password = bcryptjs.hashSync(
    this.password,
    parseInt(process.env.SALT_ROUND)
  );
  this.phone = cryptojs.AES.encrypt(
    this.phone,
    process.env.CRYPTO_SIGNATURE
  ).toString();
  this.firstName = this.firstName.split(" ")[0];
  this.lastName = this.lastName.split(" ")[1];
});

const userModel = model("User", userSchema);

export default userModel;
