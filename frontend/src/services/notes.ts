import axios from "axios";
import type { NewNoteData, NoteData } from "../types/data";
const baseUrl = "http://localhost:3001/notes";
const getAll = () => {
    const nonExisting = {
        id: "10000000",
        content: "This note is not saved to server",
        important: true,
    };
    return axios.get(baseUrl).then((response) =>
        response.data.concat(nonExisting)
    );
};
const create = (newObject: NewNoteData) => {
    return axios.post(baseUrl, newObject).then((response) => response.data);
};
const update = (id: string, newObject: NoteData) => {
    return axios.put(`${baseUrl}/${id}`, newObject).then((response) =>
        response.data
    );
};
export default {
    getAll,
    create,
    update,
};
