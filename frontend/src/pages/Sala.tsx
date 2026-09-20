import { useEffect, useRef, useState } from "react";
import usersData from "../../db.json";
import type { Message } from "../types/message";
import type { PublicUser } from "../types/user";
import "../styles/Sala.css"

function Sala() {

    const users: PublicUser[] = usersData.users;

    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem("gaming-Sala");

        return saved
        ? JSON.parse(saved)
        : [
            {
                id: 1,
                userId: 1,
                text: "¿Alguien juega",
                timestamp: "21:42",
            },
            {
                id: 2,
                userId: 2,
                text: "Sí, yo estoy disponible.",
                timestamp: "21:43",
            },
            ];
    });

    const [message, setMessage] = useState("");

    const currentUser: PublicUser = users[0];

    const messagesEndRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {
        localStorage.setItem(
        "gaming-Sala",
        JSON.stringify(messages)
        );
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        });
    }, [messages]);

    const sendMessage = () => {

        const text = message.trim();

        if (!text) return;

        const now = new Date();

        const newMessage: Message = {
        id: Date.now(),
        userId: currentUser.id,
        text,
        timestamp: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }),
        };

        setMessages((prev) => [
        ...prev,
        newMessage,
        ]);

        setMessage("");
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {

        if (event.key === "Enter") {
        sendMessage();
        }

    };

    const getUser = (userId: number): PublicUser | undefined => {
        return users.find(
        (user) => user.id === userId
        );
    };

    return (
        <div className="Sala-container">
            <aside className="sidebar">

            <div className="logo">
                PIN-GAMERS
            </div>

            <div className="server-status">
                <span className="status-dot" />
                SERVER ONLINE
            </div>

            <div className="users-title">
                <span>USUARIOS</span>
                <strong>{users.length}</strong>
            </div>

            <div className="users-list">
                {users.map((user) => {
                    const currentRank = user.rank[0]?.rankName ?? "Sin rango";

                    return (
                <div className="user-card" key={user.id}>

                    <div className="avatar-container">
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="avatar"
                    />
                    </div>

                    <div className="user-info">
                    <span className="user-name">
                        {user.name}
                    </span>

                    <span className={`user-rank ${currentRank.toLowerCase()}`}> 
                        {currentRank}
                    </span>
                    </div>

                </div>
                )})}
            </div>

            </aside>

            {/* SALA */}
            <section className="Sala">

            <header className="Sala-header">

                <div className="channel">
                <div className="channel-icon">
                    #
                </div>

                <div>
                    <h2>general</h2>
                    <span>Canal principal</span>
                </div>
                </div>

            </header>

            {/* MENSAJES */}
            <div className="messages">

                {messages.map((msg) => {
                const user = getUser(msg.userId);

                if (!user) return null;

                const currentRank = user.rank[0]?.rankName ?? "Sin rango";

                return (
                    <div className="message" key={msg.id}>

                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="message-avatar"
                    />

                    <div className="message-content">

                        <div className="message-header">

                        <span className="message-name">
                            {user.name}
                        </span>

                        <span className={`message-rank ${currentRank.toLowerCase()}`}>
                            {currentRank}
                        </span>

                        <span className="message-time">
                            {msg.timestamp}
                        </span>

                        </div>

                        <p>{msg.text}</p>

                    </div>

                    </div>
                );
                })}

                <div ref={messagesEndRef} />

            </div>

            {/* INPUT */}
            <div className="input-container">

                <div className="message-input-wrapper">

                <input
                    value={message}
                    onChange={(event) =>
                    setMessage(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                />

                <button
                    type="button"
                    className="send-button"
                    onClick={sendMessage}
                >

                </button>

                </div>

            </div>

            </section>
        </div>
    );
    }

    export default Sala;