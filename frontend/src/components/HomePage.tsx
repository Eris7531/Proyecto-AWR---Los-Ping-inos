import axios from "axios";
import type { PubilcUser } from "../types/user"
import {
    Box,
} from "@mui/material";

interface gameSelectProps {
    onSelect : (user : PubilcUser) => void;
    accesPermitionCheck : (user : PubilcUser) => void;
    permitionChange : (user : PubilcUser) => void;
}

function goToGamePage({} : gameSelectProps) {

}