import React from 'react';

const ViewNoteModal = ({ show, note, onClose, onEdit, onDelete, onPin }) => {
  if (!show || !note) return null;

  const getTagClass = (tag) => {
    const tag_classes = {
      'To-Do': 'tag_todo',
      'Reminder': 'tag_reminder',
      'Work': 'tag_work',
      'School': 'tag_school'
    };
    return tag_classes[tag] || 'tag_default';
  };

  return (
    <div className={`modal ${!show ? 'hidden' : ''}`} onClick={(event) => {
      if (event.target.classList.contains('modal')) {
        onClose();
      }
    }}>
      <div className="modal_content" onClick={(event) => event.stopPropagation()}>
        <span className="close_view" onClick={onClose}>&times;</span>
        <h2 id="view_note_title">{note.title}</h2>
        {note.tag && (
          <div className="note_tag_display">
            <span className={`note_tag ${getTagClass(note.tag)}`}>
              {note.tag}
            </span>
          </div>
        )}
        <div className="note_content">{note.content}</div>
        <div className="note_actions">
          <button className={`btn_pin ${note.pinned ? 'pinned' : ''}`} onClick={onPin}>
            {note.pinned ? '📌 Unpin' : '📌 Pin'}
          </button>
          <button className="btn_primary" onClick={onEdit}>
            Edit
          </button>
          <button className="btn_danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewNoteModal;
