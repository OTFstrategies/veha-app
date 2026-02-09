"use client";

import * as React from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Send, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectClientNote } from "@/types/portal";
import { DEMO_USER, DEMO_NOTES } from "@/lib/demo-data";

// =============================================================================
// Note Card
// =============================================================================

interface NoteCardProps {
  note: ProjectClientNote;
  canDelete: boolean;
  onDelete: () => void;
}

function NoteCard({ note, canDelete, onDelete }: NoteCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-100">
            {note.content}
          </p>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 shrink-0 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
            aria-label="Notitie verwijderen"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-medium">{note.authorName || note.authorEmail}</span>
        <span aria-hidden="true">-</span>
        <time dateTime={note.createdAt}>
          {format(new Date(note.createdAt), "d MMM yyyy 'om' HH:mm", { locale: nl })}
        </time>
      </div>
    </div>
  );
}

// =============================================================================
// Demo Client Notes (local state, no Supabase)
// =============================================================================

interface DemoClientNotesProps {
  projectId: string;
}

export function DemoClientNotes({ projectId }: DemoClientNotesProps) {
  const [notes, setNotes] = React.useState<ProjectClientNote[]>(
    () => DEMO_NOTES[projectId] ?? []
  );
  const [newNote, setNewNote] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;

    const note: ProjectClientNote = {
      id: `demo-note-${Date.now()}`,
      projectId,
      profileId: DEMO_USER.id,
      content: newNote.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorName: DEMO_USER.fullName,
      authorEmail: DEMO_USER.email,
    };

    setNotes((prev) => [note, ...prev]);
    setNewNote("");
  }

  function handleDelete(noteId: string) {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Notities ({notes.length})
        </h3>
      </div>

      {/* Add note form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Voeg een notitie toe..."
          className="min-h-[100px] resize-none"
          aria-label="Nieuwe notitie"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!newNote.trim()} size="sm">
            <Send className="mr-2 h-4 w-4" />
            Verstuur
          </Button>
        </div>
      </form>

      {/* Notes list */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-600 dark:bg-zinc-800/50">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nog geen notities voor dit project. Voeg de eerste toe!
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              canDelete={note.profileId === DEMO_USER.id}
              onDelete={() => handleDelete(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
