import React from 'react';

const NoteItem = ({ note, onViewNote }) => {
  const getTagClass = (tag) => {
    const tag_classes = {
      'To-Do': 'tag_todo',
      'Reminder': 'tag_reminder',
      'Work': 'tag_work',
      'School': 'tag_school'
    };
    return tag_classes[tag] || 'tag_default';
  };

  const preview = note.content.length > 100 
    ? note.content.substring(0, 100) + '...' 
    : note.content;

  return (
    <div className="note_item" onClick={() => onViewNote(note)}>
      <div className={`note_tag ${getTagClass(note.tag || '')}`}>
        {note.tag || 'No Tag'}
      </div>
      <h3>{note.title}</h3>
      <p>{preview}</p>
    </div>
  );
};

export default NoteItem;
