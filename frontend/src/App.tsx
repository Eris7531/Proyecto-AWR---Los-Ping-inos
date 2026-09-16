import { useEffect, useState } from "react";
import "./App.css";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { NewNoteData, NoteData } from "./types/data";
import Note from "./components/Note";
import axios from "axios";
import noteService from "./services/notes";
import { Alert, Snackbar } from "@mui/material";

const App = () => {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log("effect");
    noteService.getAll().then((data) => {
      console.log("promise fulfilled");
      setNotes(data);
    });
  }, []);

  const addNote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const noteObject: NewNoteData = {
      content: newNote,
      important: Math.random() < 0.5,
    };
    noteService.create(noteObject)
      .then((data) => {
        console.log(data);
        setNotes(notes.concat(data));
        setNewNote("");
      });
  };

  const toggleImportance = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const changedNote = { ...note, important: !note.important };
    noteService.update(id, changedNote).then(
      (data) => {
        setNotes(notes.map((n) => (n.id !== id ? n : data)));
      },
    ).catch((error) => {
      setMessage(`the note '${note.content}' was already deleted from server`);
    });
  };

  const notesToShow = showAll ? notes : notes.filter((note) => note.important);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Notes
      </Typography>
      <Button onClick={() => setShowAll(!showAll)} sx={{ mb: 2 }}>
        show {showAll ? "important" : "all"}
      </Button>
      <Paper variant="outlined">
        <List disablePadding>
          {notesToShow.map((note) => (
            <Note
              key={note.id}
              toggleImportance={toggleImportance}
              note={note}
            />
          ))}
        </List>
      </Paper>

      <Stack
        component="form"
        onSubmit={addNote}
        direction="row"
        spacing={1}
        sx={{ mt: 3 }}
      >
        <TextField
          label="New note"
          size="small"
          fullWidth
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <Button type="submit" variant="contained">
          save
        </Button>
      </Stack>
      <Snackbar
        open={message !== null}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
      >
        <Alert severity="error">{message}</Alert>
      </Snackbar>
    </Container>
  );
};
export default App;
