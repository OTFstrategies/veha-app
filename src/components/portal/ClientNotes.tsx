"use client";

import * as React from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Send, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProjectNotes, useAddProjectNote, useDeleteProjectNote } from "@/queries/portal";
import { useToast } from "@/components/ui/toast";
import type { ProjectClientNote } from "@/types/portal";

// =============================================================================
// Types
// =============================================================================

interface ClientNotesProps {
  projectId: string;
  userRole: "klant_editor" | "klant_viewer";
  currentUserId: string;
}

// =============================================================================
// Note Card Component
// =============================================================================

interface NoteCardProps {
  note: ProjectClientNote;
  canDelete: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

function NoteCard({ note, canDelete, onDelete, isDeleting }: NoteCardProps) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800/50">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-stone-900 whitespace-pre-wrap dark:text-stone-100">
            {note.content}
          </p>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={isDeleting}
            className="shrink-0 h-8 w-8 text-stone-400 hover:text-red-500 dark:text-stone-500 dark:hover:text-red-400"
            aria-label="Notitie verwijderen"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
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
// Loading Skeleton
// =============================================================================

function NotesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-lg border border-stone-200 bg-stone-100 animate-pulse dark:border-stone-700 dark:bg-stone-800"
        />
      ))}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ClientNotes({ projectId, userRole, currentUserId }: ClientNotesProps) {
  const [newNote, setNewNote] = React.useState("");
  const { data: notes, isLoading } = useProjectNotes(projectId);
  const addNote = useAddProjectNote();
  const deleteNote = useDeleteProjectNote();
  const { addToast } = useToast();

  const canAddNotes = userRole === "klant_editor";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await addNote.mutateAsync({ projectId, content: newNote.trim() });
      setNewNote("");
      addToast({ type: "success", title: "Notitie toegevoegd" });
    } catch (error) {
      addToast({ type: "error", title: "Fout bij toevoegen notitie" });
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm("Weet je zeker dat je deze notitie wilt verwijderen?")) return;

    try {
      await deleteNote.mutateAsync({ noteId, projectId });
      addToast({ type: "success", title: "Notitie verwijderd" });
    } catch (error) {
      addToast({ type: "error", title: "Fout bij verwijderen notitie" });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-stone-500" />
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">
            Notities
          </h3>
        </div>
        <NotesSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-stone-500 dark:text-stone-400" />
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">
          Notities ({notes?.length || 0})
        </h3>
      </div>

      {/* Add note form - alleen voor editors */}
      {canAddNotes && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Voeg een notitie toe..."
            className="min-h-[100px] resize-none"
            aria-label="Nieuwe notitie"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newNote.trim() || addNote.isPending}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {addNote.isPending ? "Verzenden..." : "Verstuur"}
            </Button>
          </div>
        </form>
      )}

      {/* Notes list */}
      <div className="space-y-4">
        {notes?.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-8 text-center dark:border-stone-600 dark:bg-stone-800/50">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Nog geen notities voor dit project.
              {canAddNotes && " Voeg de eerste toe!"}
            </p>
          </div>
        ) : (
          notes?.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              canDelete={note.profileId === currentUserId}
              onDelete={() => handleDelete(note.id)}
              isDeleting={deleteNote.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}
