import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { 
	Alert,
	Avatar,
	Box,
	CircularProgress, 
	IconButton, 
	TextField, 
	Typography 
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import type { Message } from "../../types/message";


interface ChatBoxProps {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  sending: boolean;
  error: string;
  onSend: (content: string) => Promise<void>;
}

export default function ChatBox({
  messages,
  currentUserId,
  loading,
  sending,
  error,
  onSend,
}: ChatBoxProps) {	
	const [text, setText] = useState("");
	const [sendError, setSendError] = useState("");
	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const submit = async () => {
		const content = text.trim();

		if (!content || sending) return;

		setSendError("");

		try {
		await onSend(content);
		setText("");
		} catch {
		setSendError("No se pudo enviar el mensaje. Inténtalo nuevamente.");
		}
	};


	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setText(event.target.value);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			void submit();
		}
	};

	return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "70vh" }}>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          mb: 1,
          p: 1.5,
          borderRadius: 2,
          bgcolor: "action.hover",
        }}
      >
        {loading && <CircularProgress size={24} />}

        {!loading && messages.length === 0 && (
          <Typography variant="body2">
            Aún no hay mensajes en esta sala.
          </Typography>
        )}

        {messages.map((message) => {
          const ownMessage = message.sender.id === currentUserId;

          return (
            <Box
              key={message.id}
              sx={{
                display: "flex",
                gap: 1,
                mb: 1.5,
                flexDirection: ownMessage ? "row-reverse" : "row",
              }}
            >
              <Avatar
                src={message.sender.avatar ?? undefined}
                alt={message.sender.username}
                sx={{ width: 32, height: 32 }}
              >
                {message.sender.username.charAt(0).toUpperCase()}
              </Avatar>

              <Box
                sx={{
                  maxWidth: "80%",
                  minWidth: 0,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: ownMessage
                    ? "primary.light"
                    : "background.paper",
                  color: ownMessage
                    ? "primary.contrastText"
                    : "text.primary",
                  overflowWrap: "anywhere",
                }}
              >
                <Typography variant="subtitle2">
                  {ownMessage ? "Tú" : message.sender.username}
                </Typography>

                <Typography variant="body2">
                  {message.content}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ display: "block", textAlign: "right", mt: 0.5 }}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>
            </Box>
          );
        })}

        <div ref={endRef} />
      </Box>

      {(error || sendError) && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {sendError || error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          multiline
          maxRows={4}
          placeholder="Escribe un mensaje..."
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />

        <IconButton
          color="primary"
          onClick={() => void submit()}
          disabled={sending || !text.trim()}
          aria-label="Enviar mensaje"
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}