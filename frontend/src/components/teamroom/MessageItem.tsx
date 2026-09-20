import { Avatar, Box, Chip, Typography } from "@mui/material";
import type { Message } from "../../types/message";
import type { PublicUser } from "../../types/user";
import { getRankName } from "../../utils/rank";
import { alpha } from "@mui/material/styles";

interface MessageItemProps {
    message: Message;
    user: PublicUser | undefined;
    gameId: number;
    isOwn?: boolean;
}

function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime())
        ? timestamp
        : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageItem({ message, user, gameId, isOwn}: MessageItemProps) {
    return (
        <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
        <Avatar src={user?.avatar} alt={user?.name} sx={{ width: 32, height: 32 }} />
        <Box
            sx={(theme) => ({
                flex: 1,
                minWidth: 0,
                p: 1.5,
                borderRadius: 2,
                border: 1,
                borderColor: isOwn ? "primary.main" : "divider",
                bgcolor: isOwn ? alpha(theme.palette.primary.main, 0.12) : "background.paper",
                transition: "box-shadow 0.15s, border-color 0.15s",
                "&:hover": { boxShadow: 2, borderColor: "primary.main" },
            })}
            >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle2">
                {user?.name ?? "Usuario desconocido"}
            </Typography>
            {user && (
                <Chip label={getRankName(user, gameId)} size="small" variant="outlined" />
            )}
            <Typography variant="caption">{formatTime(message.timestamp)}</Typography>
            </Box>
            <Typography variant="body2">{message.text}</Typography>
        </Box>
        </Box>
    );
}