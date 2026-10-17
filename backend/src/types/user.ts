export interface User {
  id: string;
  username: string;
  avatar: string | null;
  rank: Rank[];
}

export interface Rank {
  id: string;
  game: Game;
  rankName: string;
}

export interface Game {
  id: string;
  gameName: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput extends LoginInput {}