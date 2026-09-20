import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import type { Message } from "../../types/message";
import type { PublicUser } from "../../types/user";
import MessageItem from "./MessageItem";

interface ChatBoxProps {
	messages: Message[];
	usersById: Map<number, PublicUser>;
	gameId: number;
	currentUserId?: number;
	onSend: (text: string) => void;
}

export default function ChatBox({ messages, usersById, gameId, currentUserId, onSend }: ChatBoxProps) {
	const [text, setText] = useState<string>("");
	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const submit = (): void => {
		const trimmed = text.trim();
		if (!trimmed) return;
		onSend(trimmed);
		setText("");
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setText(event.target.value);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
		if (event.key === "Enter") submit();
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", height: "85vh" }}>
		<Box sx={{ flex: 1, overflowY: "auto", mb: 1, p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
			{messages.length === 0 && (
			<Typography variant="body2">Aún no hay mensajes.</Typography>
			)}

			{messages.map((msg) => (
			<MessageItem
				key={msg.id}
				message={msg}
				user={usersById.get(msg.userId)}
				gameId={gameId}
				isOwn={msg.userId === currentUserId}
			/>
			))}

			<div ref={endRef} />
		</Box>

		<Box sx={{ display: "flex", gap: 1 }}>
			<TextField
			fullWidth
			size="small"
			placeholder="Escribe un mensaje..."
			value={text}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			/>
			<IconButton color="primary" onClick={submit} aria-label="Enviar mensaje">
			<SendIcon />
			</IconButton>
		</Box>
		</Box>
	);
}