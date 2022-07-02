import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
export const USER_TYPES = {
  CONSUMER: "consumer",
  SUPPORT: "support",
};

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    firstName: String,
    lastName: String,
    email: String,
    type: String,
    password:{
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
    collection: "users",
  }
);

userSchema.statics.createUser = async function (
  firstName,
  lastName,
  type,
  password,
  email
) {
  try {
    const checkEmail = await this.findOne({ email });
    if (checkEmail) throw ({ error: 'Email already exists' });
    const encodedPassword = await bcrypt.hash(password, 10);
    const user = await this.create({ firstName, lastName, type, password:encodedPassword,email });
    
    return user;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.getUserById = async function (id) {
  try {
    const user = await this.findOne({ _id: id });
    if (!user) throw ({ error: 'No user with this id found' });
    return user;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.getUserByEmail = async function (email) {
  try {
    const user = await this.findOne({ email },{password:0});
    if (!user) throw ({ error: 'No user with this email found' });
    return user;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.getUsers = async function () {
  try {
    // exclude password
    const users = await this.find({}, { password: 0 });
    return users;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.deleteByUserById = async function (id) {
  try {
    const result = await this.remove({ _id: id });
    return result;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.getUserByIds = async function (ids) {
  try {
    const users = await this.find({ _id: { $in: ids } });
    return users;
  } catch (error) {
    throw error;
  }
}

export default mongoose.model("User", userSchema);