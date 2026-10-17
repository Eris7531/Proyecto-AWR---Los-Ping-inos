
import mongoose, { Schema } from "mongoose";

const GameSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    salas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Sala",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Game = mongoose.model("Game", GameSchema);

GameSchema.set("toJSON", {
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
  },
});

export default Game;
