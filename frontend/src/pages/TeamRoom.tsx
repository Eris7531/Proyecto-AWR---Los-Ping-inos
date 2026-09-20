import { useParams } from "react-router-dom";
import { Box, Paper, Stack, Typography } from "@mui/material";
import MemberList from "../components/teamroom/MemberList";
import ChatBox from "../components/teamroom/ChatBox";
import { useTeamRoom } from "../hooks/useTeamRoom";
import type { PublicUser } from "../types/user";

interface TeamRoomParams extends Record<string, string | undefined> {
    equipoId?: string;
}

export default function TeamRoomPage() {
    const { equipoId } = useParams<TeamRoomParams>();
    const { team, members, usersById, messages, sendMessage } = useTeamRoom(equipoId ?? "");

    // reemplazar por usauario real cuando exista la bbdd
    const currentUser: PublicUser | undefined = members[0];

    const handleSend = (text: string): void => {
        if (!currentUser) return;
        sendMessage(currentUser.id, text);
    };

    if (!team) {
        return <Typography sx={{ p: 2 }}>Equipo no encontrado.</Typography>;
    }

    return (
        <Box sx={{ p: 2, minHeight: "100vh", bgcolor: "action.hover" }}>
        <Typography variant="h4" gutterBottom>
            {team.name}
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Paper variant="outlined" sx={{ p: 2, width: { md: 260 } }}>
            <MemberList members={members} gameId={team.gameId} />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
            <ChatBox
                messages={messages}
                usersById={usersById}
                gameId={team.gameId}
                currentUserId={currentUser?.id}
                onSend={handleSend}
            />
            </Paper>
        </Stack>
        </Box>
    );
}