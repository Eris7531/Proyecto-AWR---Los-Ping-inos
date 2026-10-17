import mongoose from "mongoose";
import type { Rank } from "../types/user";

interface UserData {
  username: string;
  passwordHash: string;
  avatar: string | null;
  rank: Rank[];
  notes: mongoose.Types.ObjectId[];
}

const rankSchema = new mongoose.Schema<Rank>(
  {
    id: { type: String, required: true },
    game: {
      id: { type: String, required: true },
      gameName: { type: String, required: true },
    },
    rankName: { type: String, required: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema<UserData>({
  username: { type: String, required: true, unique: true },
  passwordHash: String,
  avatar: { type: String, default: null },
  rank: { type: [rankSchema], default: [] },
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