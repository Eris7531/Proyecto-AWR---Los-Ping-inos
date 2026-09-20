import type { PublicUser } from "../types/user";

export function getRankName(user: PublicUser, gameId: number): string {
    return user.rank.find((r) => r.Game.id === gameId)?.rankName ?? "Sin rango";
}