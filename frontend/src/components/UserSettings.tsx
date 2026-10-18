import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { apiRequest } from "../services/api";
import type { User } from "../types/user";

interface GameOption {
  id: string;
  name: string;
  image: string;
}

interface RankOptionsResponse {
  gameId: string;
  gameName: string;
  ranks: string[];
}

interface UserSettingsProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

export default function UserSettings({
  user,
  onUserUpdated,
}: UserSettingsProps) {
  const [games, setGames] = useState<GameOption[]>([]);
  const [gameId, setGameId] = useState("");
  const [rankOptions, setRankOptions] = useState<string[]>([]);
  const [rankName, setRankName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingRankId, setEditingRankId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const editingRank = user.rank.find((rank) => rank.id === editingRankId);
  const selectedGameId = editingRank?.game.id ?? gameId;
  const availableGames = games.filter(
    (game) => !user.rank.some((rank) => rank.game.id === game.id),
  );

  useEffect(() => {
    let active = true;

    apiRequest<GameOption[]>("/games")
      .then((result) => {
        if (active) setGames(result);
      })
      .catch((reason: Error) => {
        if (active) setError(reason.message);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(user.avatar ?? "");
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile, user.avatar]);

  useEffect(() => {
    let active = true;

    if (!selectedGameId) {
      setRankOptions([]);
      return;
    }

    apiRequest<RankOptionsResponse>(
      `/games/${encodeURIComponent(selectedGameId)}/ranks`,
    )
      .then((result) => {
        if (active) setRankOptions(result.ranks);
      })
      .catch((reason: Error) => {
        if (active) setError(reason.message);
      });

    return () => {
      active = false;
    };
  }, [selectedGameId]);

  const saveAvatar = async () => {
    if (!avatarFile) return;

    setError("");
    setSuccess("");
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const updated = await apiRequest<User>("/users/me/avatar", {
        method: "PATCH",
        body: formData,
      });
      onUserUpdated(updated);
      setAvatarFile(null);
      setSuccess("Foto de perfil actualizada.");
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarSelection = (file: File | undefined) => {
    if (!file) return;

    if (
      !/\.jpe?g$/i.test(file.name) ||
      (file.type !== "" && file.type !== "image/jpeg")
    ) {
      setAvatarFile(null);
      setError("Selecciona una imagen JPG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarFile(null);
      setError("La imagen debe pesar 5 MB o menos.");
      return;
    }

    setError("");
    setSuccess("");
    setAvatarFile(file);
  };

  const saveRank = async () => {
    setError("");
    setSuccess("");

    try {
      const path = editingRankId
        ? `/users/me/ranks/${encodeURIComponent(editingRankId)}`
        : "/users/me/ranks";
      const updated = await apiRequest<User>(path, {
        method: editingRankId ? "PATCH" : "POST",
        body: JSON.stringify(
          editingRankId ? { rankName } : { gameId, rankName },
        ),
      });

      onUserUpdated(updated);
      setEditingRankId(null);
      setRankName("");
      setGameId("");
      setSuccess("Rango guardado.");
    } catch (reason) {
      setError((reason as Error).message);
    }
  };

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Typography variant="h6">Foto de perfil</Typography>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Avatar src={avatarPreview || undefined} alt={user.username} />
        <Stack spacing={1}>
          <Button component="label" variant="outlined">
            Seleccionar JPG
            <input
              hidden
              type="file"
              accept=".jpg,.jpeg,image/jpeg"
              disabled={uploadingAvatar}
              onChange={(event) => {
                handleAvatarSelection(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </Button>
          <Typography variant="body2" color="text.secondary">
            {avatarFile?.name ?? "JPG de hasta 5 MB"}
          </Typography>
        </Stack>
      </Stack>
      <Button
        variant="contained"
        onClick={() => void saveAvatar()}
        disabled={!avatarFile || uploadingAvatar}
      >
        {uploadingAvatar ? <CircularProgress size={20} color="inherit" /> : "Guardar foto"}
      </Button>

      <Typography variant="h6" sx={{ pt: 1 }}>
        {editingRank ? "Editar rango" : "Agregar juego y rango"}
      </Typography>

      {editingRank ? (
        <TextField
          label="Juego"
          value={editingRank.game.gameName}
          disabled
          fullWidth
        />
      ) : (
        <TextField
          select
          label="Juego"
          value={gameId}
          onChange={(event) => {
            setGameId(event.target.value);
            setRankName("");
            setError("");
          }}
          fullWidth
        >
          {availableGames.map((game) => (
            <MenuItem key={game.id} value={game.id}>
              {game.name}
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        select
        label="Rango"
        value={rankName}
        onChange={(event) => setRankName(event.target.value)}
        disabled={!selectedGameId || rankOptions.length === 0}
        fullWidth
      >
        {rankOptions.map((rank) => (
          <MenuItem key={rank} value={rank}>
            {rank}
          </MenuItem>
        ))}
      </TextField>

      {selectedGameId && rankOptions.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Todavía no hay rangos definidos para este juego.
        </Typography>
      )}

      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          onClick={() => void saveRank()}
          disabled={!rankName || (!editingRankId && !gameId)}
        >
          {editingRank ? "Guardar rango" : "Agregar juego"}
        </Button>
        {editingRank && (
          <Button
            onClick={() => {
              setEditingRankId(null);
              setRankName("");
            }}
          >
            Cancelar
          </Button>
        )}
      </Stack>

      {user.rank.map((rank) => (
        <Stack
          key={rank.id}
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography>
            {rank.game.gameName}: {rank.rankName}
          </Typography>
          <Button
            onClick={() => {
              setError("");
              setEditingRankId(rank.id);
              setRankName(rank.rankName);
            }}
          >
            Editar
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}