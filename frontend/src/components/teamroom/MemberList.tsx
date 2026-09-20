import {
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from "@mui/material";
import type { PublicUser } from "../../types/user";
import { getRankName } from "../../utils/rank";

interface MemberListProps {
    members: PublicUser[];
    gameId: number;
}

export default function MemberList({ members, gameId }: MemberListProps) {
    return (
        <>
            <Typography variant="h6">Integrantes ({members.length})</Typography>

            {members.length === 0 ? (
                <Typography variant="body2" sx={{ mt: 1 }}>
                Este equipo aún no tiene integrantes.
                </Typography>
            ) : (
                <List>
                {members.map((member) => (
                    <ListItem
                        key={member.id}
                        sx={{
                            mb: 1,
                            borderRadius: 2,
                            border: 1,
                            borderColor: "divider",
                            bgcolor: "action.hover",
                            transition: "background-color 0.15s",
                            "&:hover": { bgcolor: "action.selected" },
                        }}
                    >
                    <ListItemAvatar>
                        <Avatar src={member.avatar} alt={member.name} />
                    </ListItemAvatar>
                    <ListItemText
                        primary={member.name}
                        secondary={getRankName(member, gameId)}
                    />
                    </ListItem>
                ))}
                </List>
            )}
        </>
    );
}