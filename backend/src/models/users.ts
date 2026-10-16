import mongoose from "mongoose";

interface UserData {
  id: string;
  username: string;
  passwordHash: string;
  notes: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema<UserData>({
  username: { type: String, required: true, unique: true },
  passwordHash: String,
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    },
  ],
});

const User = mongoose.model("User", userSchema);

userSchema.set("toJSON", {
  transform: (
    document,
    returnedObject: {
      id?: string;
      _id?: mongoose.Types.ObjectId;
      __v?: number;
      passwordHash?: string;
    }
  ) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash;
  },
});

export default User;