import { useEffect,  useState } from "react";
import db from "../../db.json";
import type { Message } from "../types/message";
import type { PublicUser } from "../types/user";
import type { Team } from "../types/team";

//  placeholders que se reemplazan por llamadas a servicios cuando exista backend
const ALL_USERS: PublicUser[] = db.users;
const ALL_TEAMS: Team[] = db.teams;
const USERS_BY_ID = new Map<number, PublicUser>(ALL_USERS.map((u) => [u.id, u]));

const SEED_MESSAGES: Message[] = [
    {
        id: 1,
        userId: 1,
        text: "¿Alguien juega?",
        timestamp: new Date(Date.now() - 120_000).toISOString(),
    },
    {
        id: 2,
        userId: 2,
        text: "Sí, yo estoy disponible.",
        timestamp: new Date(Date.now() - 60_000).toISOString(),
    },
];

const storageKey = (teamId: string): string => `chat:${teamId}`;

function loadMessages(teamId: string): Message[] {
    try {
        const saved = localStorage.getItem(storageKey(teamId));
        return saved ? (JSON.parse(saved) as Message[]) : SEED_MESSAGES;
    } catch {
        return SEED_MESSAGES;
    }
}

interface UseTeamRoomResult {
  team: Team | undefined;
  members: PublicUser[];
  usersById: Map<number, PublicUser>;
  messages: Message[];
  sendMessage: (userId: number, text: string) => void;
}

export function useTeamRoom(teamId: string): UseTeamRoomResult {
    const team = ALL_TEAMS.find((t) => t.id === Number(teamId));

    const members: PublicUser[] = (team?.memberIds ?? [])
        .map((id) => USERS_BY_ID.get(id))
        .filter((u): u is PublicUser => u !== undefined);

    const [messages, setMessages] = useState<Message[]>(() => loadMessages(teamId));

    useEffect(() => {
        setMessages(loadMessages(teamId));
    }, [teamId]);

    const sendMessage = (userId: number, text: string): void => {
        const next: Message[] = [
        ...messages,
        {
            id: Math.max(0, ...messages.map((m) => m.id)) + 1,
            userId,
            text,
            timestamp: new Date().toISOString(),
        },
        ];
        setMessages(next);
        localStorage.setItem(storageKey(teamId), JSON.stringify(next));
    };

    return { team, members, usersById: USERS_BY_ID, messages, sendMessage };
}