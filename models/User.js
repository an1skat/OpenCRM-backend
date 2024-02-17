import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      unique: true,
    },
    lastName: {
      type: String,
      required: true,
      unique: true,
    },
    surname: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.statics.findOrCreate = async function (query) {
  try {
    const user = await this.findOne(query);
    if (user) {
      return user;
    }
    const newUser = new this(query);
    await newUser.save();
    return newUser;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default mongoose.model("User", userSchema);
