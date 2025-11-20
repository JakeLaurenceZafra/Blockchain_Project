import React, { useState, useEffect } from 'react';

const CreateNoteModal = ({ show, onClose, onSave, editingNote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title || '');
      setContent(editingNote.content || '');
      setTag(editingNote.tag || '');
    } else {
      setTitle('');
      setContent('');
      setTag('');
    }
  }, [editingNote, show]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (title.trim() && content.trim() && tag) {
      onSave({ title: title.trim(), content: content.trim(), tag });
      setTitle('');
      setContent('');
      setTag('');
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setTag('');
    onClose();
  };

  if (!show) return null;

  return (
    <div className={`modal ${!show ? 'hidden' : ''}`} onClick={(event) => {
      if (event.target.classList.contains('modal')) {
        handleClose();
      }
    }}>
      <div className="modal_content" onClick={(event) => event.stopPropagation()}>
        <span className="close" onClick={handleClose}>&times;</span>
        <h2>{editingNote ? 'Edit Note' : 'Create New Note'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form_group">
            <label htmlFor="note_title">Title:</label>
            <input
              type="text"
              id="note_title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="Enter note title"
            />
          </div>
          <div className="form_group">
            <label htmlFor="note_content">Note:</label>
            <textarea
              id="note_content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              placeholder="Enter your note content"
            />
          </div>
          <div className="form_group">
            <label htmlFor="note_tag">Tag:</label>
            <select
              id="note_tag"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              required
            >
              <option value="">Select a tag</option>
              <option value="To-Do">To-Do</option>
              <option value="Reminder">Reminder</option>
              <option value="Work">Work</option>
              <option value="School">School</option>
            </select>
          </div>
          <div className="form_actions">
            <button type="submit" className="btn_primary">
              {editingNote ? 'Update' : 'Save'}
            </button>
            <button type="button" className="btn_secondary" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNoteModal;
