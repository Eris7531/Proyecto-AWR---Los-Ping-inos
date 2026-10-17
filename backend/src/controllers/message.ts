import express, { Request, Response } from 'express';
import Message from '../models/message';
import Room from '../models/room';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    _id: string;
    username: string;
  };
}

//obtener historial de mensajes de la sala
router.get('/:roomId/messages', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    //validar que la sala exista (404 si no existe)
    const roomExists = await Room.findById(roomId);
    if (!roomExists) {
      return res.status(404).json({ error: "La sala solicitada no existe." });
    }

    //buscar mensajes de esta sala
    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 }) 
      .populate('senderId', 'username avatar')
      .limit(100);

    //responder si funciona
    res.status(200).json(messages);

  } catch (error) {
    //codigo 500 para errores internos
    res.status(500).json({ error: "Error al cargar el historial del chat." });
  }
});

//enviar mensaje
router.post('/:roomId/messages', async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;

    //validar datos
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ error: "El mensaje no puede estar vacío." });
    }

    const senderId = req.user?._id; 
    if (!senderId) {
      return res.status(401).json({ error: "No tienes sesión válida para comentar." });
    }

    //guardar en mongoDB
    const newMessage = new Message({
      roomId,
      senderId,
      content
    });

    await newMessage.save();

    await newMessage.populate('senderId', 'username avatar');

    //creado exitosamente (codigo 201)
    res.status(201).json(newMessage);

  } catch (error) {
    res.status(500).json({ error: "No se pudo enviar el mensaje." });
  }
});

export default router;