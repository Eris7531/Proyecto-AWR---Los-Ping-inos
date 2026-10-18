import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import type { Game } from "../types/room";

interface UseGamesResult {
  games: Game[];
  loading: boolean;
  error: string;
}

export function useGames(): UseGamesResult {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<Game[]>("/games")
      .then(setGames)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { games, loading, error };
}
