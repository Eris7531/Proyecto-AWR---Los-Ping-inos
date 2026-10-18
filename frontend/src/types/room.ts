
export interface Room {
  id: string;
  name: string;
  rankName: string;
  requiredRank: string;
  game: {
    id?:string;
    _id?: string;
    name:string;
    image:string;
  };
  currentPlayers: number;
  maxPlayers: number;
}

export interface Game {
  id: string;
  name: string;
  image: string;
  usersInRooms?: number;
}

export interface RoomMember {
  _id: string;
  username: string;
  avatar: string;
}

export interface RoomDetail extends Omit<Room, "game"> {
  game: Game | string;
  users: RoomMember[];
  chat?: string | null;
}