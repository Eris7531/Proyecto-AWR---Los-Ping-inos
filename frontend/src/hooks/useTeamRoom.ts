
import { useEffect, useState } from "react";
import db from "../../db.json";
import type { Message, MessageSender } from "../types/message";
import type { User } from "../types/user";
import type { Team } from "../types/team";

// Datos temporales mientras no exista backend
const ALL_USERS: User[] = db.users;
const ALL_TEAMS: Team[] = db.teams;

const USERS_BY_ID = new Map<string, User>(
    ALL_USERS.map((u) => [u.id, u])
);

const storageKey = (teamId: string): string => `chat:${teamId}`;

function loadMessages(teamId: string): Message[] {
    try {
        const saved = localStorage.getItem(storageKey(teamId));
        return saved ? (JSON.parse(saved) as Message[]) : [];
    } catch {
        return [];
    }
}

interface UseTeamRoomResult {
    team: Team | undefined;
    members: User[];
    usersById: Map<string, User>;
    messages: Message[];
    sendMessage: (userId: string, text: string) => void;
}

export function useTeamRoom(teamId: string): UseTeamRoomResult {
    const team = ALL_TEAMS.find((t) => t.id === Number(teamId));

    const members: User[] = (team?.memberIds ?? [])
        .map((id) => USERS_BY_ID.get(id))
        .filter((u): u is User => u !== undefined);

    const [messages, setMessages] = useState<Message[]>(
        () => loadMessages(teamId)
    );

    useEffect(() => {
        setMessages(loadMessages(teamId));
    }, [teamId]);

    const sendMessage = (userId: string, text: string): void => {
        if (!text.trim()) return;

        const user = USERS_BY_ID.get(userId);
        if (!user) return;

        const sender: MessageSender = {
            id: user.id,
            username: user.username,
            avatar: user.avatar ?? null,
        };

        const next: Message[] = [
            ...messages,
            {
                id: crypto.randomUUID(),
                roomId: teamId,
                sender,
                content: text.trim(),
                createdAt: new Date().toISOString(),
            },
        ];

        setMessages(next);
        localStorage.setItem(storageKey(teamId), JSON.stringify(next));
    };

    return {
        team,
        members,
        usersById: USERS_BY_ID,
        messages,
        sendMessage,
    };
}
