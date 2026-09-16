import { useState } from "react";
import axios from "axios";
import type {User} from "../types/data"
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    Paper,
} from "@mui/material";


interface LoginProps {
    onLogin: (user: User) => void;
    onGoToRegister: () => void;
};

function Login({onLogin, onGoToRegister}: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");

        try { 
            const response = await axios.get<User[]>(
                "http://localhost:3001/users"
            );

            const users = response.data;
            const user = users.find(
                (user) => user.email === email && user.password === password
            );

            if (!user) {
                setError("Correo electrónico o contraseña incorrectos");
                return;
            }

            onLogin(user);
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            setError("Error al iniciar sesión. Por favor, inténtalo de nuevo.");
        }
    };

    return (
        <Box
            sx={{
                minHeight: "calc(100vh - 64px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    width: "100%",
                    maxWidth: 400,
                    p:4,
                }}
            >
                <Typography variant="h5" component="h1" gutterBottom>
                    Iniciar sesión
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleLogin}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mt: 2,
                    }}
                >
                    <TextField
                        label= "Correo electrónico"
                        type= "email"
                        value= {email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        fullWidth
                    />
                    
                    <TextField
                        label= "Contraseña"
                        type="password"
                        value={password}
                        onChange={(event)=> setPassword(event.target.value)}
                        required
                        fullWidth
                    />

                    {error && <Alert severity="error">{error}</Alert>}

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                    >
                        Iniciar sesión
                    </Button>

                    <Button
                        type="button"
                        variant="text"
                        onClick={onGoToRegister}
                    >
                        Crear Cuenta
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default Login;