import type { User } from "../types/user";

export function getRankName(user: User, gameId: number): string {
    return user.rank.find((rank) => rank.game.id === String(gameId))?.rankName ?? "Sin rango";
}