import {useState} from "react";
import axios from "axios";
import type { AuthenticatedUser } from "../types/user"
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    Paper,
} from "@mui/material";


interface RegisterProps {
    onRegister: (user: AuthenticatedUser) => void;
    onGoToLogin: () => void;
}

function Register({ onRegister, onGoToLogin, }: RegisterProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async( event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword){
            setError("Las contraseñas no coinciden.");
            return;
        }
        try {
            const response = await axios.get<AuthenticatedUser[]>(
                "http://localhost:3001/authUsers"
            );

            const users = response.data;
            const existingUser = users.find((user) => user.email === email);

            if (existingUser) {
                setError("Ya existe una cuenta con este correo.");
                return;
            }

            const newUser = await axios.post<AuthenticatedUser> (
                "http://localhost:3001/authUsers",
                {
                    name,
                    avatar: "",
                    rank: [],
                    email,
                    password
                }
            );

            onRegister(newUser.data);
        } catch (error) {
            console.error("Error al registrarse", error);
            setError("No se pudo completar el registro.");
        }
    };

    return (
        <Box
            sx={{
                minHeight: "calc(100vh - 64px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    width: "100%",
                    maxWidth: 400,
                    p: 4,
                }}
            >
                <Typography variant="h5" component="h1" gutterBottom>
                    Crear Cuenta
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleRegister}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mt: 2,
                    }}
                >
                    <TextField
                        label="Nombre"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Correo electrónico"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        fullWidth                   
                    />
                    <TextField
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Confirmar contraseña"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                        fullWidth
                    />

                    {error && <Alert severity="error">{error}</Alert>}
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                    >
                        Registrarse
                    </Button>
                    <Button
                        type="button"
                        variant="text"
                        onClick={onGoToLogin}
                    >
                        Ya tengo una cuenta
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default Register;
