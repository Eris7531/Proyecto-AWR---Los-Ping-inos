import { Schema, model, Document, Types } from 'mongoose';

//PLANTILLA QUE HICE RAPIDO CON IA PQ NECESITABA EL MODELO DE ROOM LISTO PARA PROBAR EL CHAT

// 1. Interfaz estricta para TypeScript
export interface IRoom extends Document {
  name: string;
  gameId: string; // Puede ser el ID del juego o un string como "minecraft", "lol", etc.
  participants: Types.ObjectId[]; // Arreglo de IDs de los usuarios en la sala
  createdAt: Date;
  updatedAt: Date;
}

// 2. Esquema de Mongoose
const roomSchema = new Schema<IRoom>({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  gameId: { 
    type: String, 
    required: true,
    index: true // Útil si después quieres buscar "todas las salas del juego X"
  },
  participants: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, {
  timestamps: true // Genera createdAt y updatedAt
});

const Room = model<IRoom>('Room', roomSchema);

export default Room;