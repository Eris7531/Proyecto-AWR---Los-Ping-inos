
export interface PubilcUser {
  id : number;
  name : string;
  avatar : string;
  rank : Array<Rank>;
}

export interface AuthenticatedUser extends PubilcUser {
  email : string;
  password : string;
}

export interface Rank {
  id : number;
  Game : Game;
  rankName : string;
}

export interface Game {
  id : number;
  gameName : string;
}