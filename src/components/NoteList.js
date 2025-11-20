import React from 'react';
import NoteItem from './NoteItem';

const NoteList = ({ notes, onViewNote, currentFilter }) => {
  if (notes.length === 0) {
    const message = currentFilter === 'all' 
      ? 'No notes yet. Click "Create Note" to add your first note!'
      : `No notes with tag "${currentFilter}" yet.`;
    
    return (
      <div className="empty_state">
        <h2>No notes found</h2>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className="notes_list">
      {notes.map(note => (
        <NoteItem key={note.id} note={note} onViewNote={onViewNote} />
      ))}
    </div>
  );
};

export default NoteList;
