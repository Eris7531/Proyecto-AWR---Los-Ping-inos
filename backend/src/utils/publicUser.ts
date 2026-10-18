import type { User as UserContract, Rank } from "../types/user";

interface UserRecord {
  _id: { toString: () => string };
  username: string;
  avatar?: string | null;
  rank?: Rank[];
}

export function toPublicUser(user: UserRecord): UserContract {
  return {
    id: user._id.toString(),
    username: user.username,
    avatar: user.avatar ?? null,
    rank: user.rank ?? [],
  };
}