import mongoose, {Schema} from "mongoose";

const RoomSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 60,
        },
        // Rango descriptivo de la sala, por ejemplo: "Principiante", "Intermedio", "Competitivo", etc.
        rankName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 40,
        },
        // Rango mínimo requerido para unirse a la sala.
        requiredRank: {
            type: String,
            required: true,
            trim: true,
            maxlength: 40,
        },
        game: {
            type: Schema.Types.ObjectId,
            ref: "Game",
            required: true,
            index: true,
        },
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        maxPlayers: {
            type: Number,
            required: true,
            min: 1,
            max: 100, // Depende del juego.
            default: 5,
        },
        chat: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            default: null,
        },
    },

    {
        timestamps: true,
        versionKey: false,  
    }
);

RoomSchema.set("toJSON", {
    transform: (_document, returnedObject: {
        id?: string;
        _id?: mongoose.Types.ObjectId;
        __v?: number;
    }) => {
        returnedObject.id = returnedObject._id?.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

const Room = mongoose.model("Room", RoomSchema);

export default Room;