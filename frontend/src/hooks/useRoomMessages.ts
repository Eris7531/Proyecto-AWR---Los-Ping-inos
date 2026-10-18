import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import type { Message } from "../types/message";

interface UseRoomMessagesResult {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  error: string;
  sendMessage: (content: string) => Promise<void>;
}

export function useRoomMessages(
  roomId: string
): UseRoomMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    if (!roomId) return;

    try {
      const result = await apiRequest<Message[]>(
        `/rooms/${encodeURIComponent(roomId)}/messages`
      );

      setMessages(result);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el historial"
      );
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    let active = true;

    setMessages([]);
    setLoading(true);
    setError("");

    const load = async () => {
      try {
        const result = await apiRequest<Message[]>(
          `/rooms/${encodeURIComponent(roomId)}/messages`
        );

        if (active) {
          setMessages(result);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el historial"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (roomId) {
      void load();

      const intervalId = window.setInterval(() => {
        void loadMessages();
      }, 3000);

      return () => {
        active = false;
        window.clearInterval(intervalId);
      };
    }

    setLoading(false);

    return () => {
      active = false;
    };
  }, [roomId, loadMessages]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();

    if (!trimmed || sending) return;

    setSending(true);
    setError("");

    try {
      const created = await apiRequest<Message>(
        `/rooms/${encodeURIComponent(roomId)}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content: trimmed }),
        }
      );

      setMessages((current) => {
        if (current.some((message) => message.id === created.id)) {
          return current;
        }

        return [...current, created].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo enviar el mensaje";

      setError(message);
      throw err;
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
  };
}
