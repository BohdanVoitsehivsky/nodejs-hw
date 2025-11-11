import { Router } from "express";

import { getAllNotes,getNoteById, createNote,deleteNote, updateNote} from "../controllers/notesController.js";
const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ ok: true, service: "notes-api" });
});

router.get("/notes", getAllNotes);

router.get("/notes/:noteId", getNoteById  );
router.post("/notes", createNote);
router.delete("/notes/:noteId", deleteNote);
router.patch("/notes/:noteId", updateNote);
export default router;
