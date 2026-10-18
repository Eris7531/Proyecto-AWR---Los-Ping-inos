
export interface MessageSender {
  id: string;
  username: string;
  avatar: string | null;
}

export interface Message {
  id: string;
  roomId: string;
  sender: MessageSender;
  content: string;
  createdAt: string;
}