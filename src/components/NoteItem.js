import React, { useState } from 'react';

const NoteItem = ({ note, onViewNote }) => {
  const [copied, setCopied] = useState(false);

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

  const handleCopyTransaction = async (e) => {
    e.stopPropagation(); // Prevent opening the note
    try {
      await navigator.clipboard.writeText(note.transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = note.transactionId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="note_item" onClick={() => onViewNote(note)}>
      <div className={`note_tag ${getTagClass(note.tag || '')}`}>
        {note.tag || 'No Tag'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ flex: 1, marginRight: '10px' }}>{note.title}</h3>
        {note.transactionId && (
          <button
            onClick={handleCopyTransaction}
            title={copied ? 'Copied!' : 'Copy Transaction Hash'}
            style={{
              background: copied ? '#4ecdc4' : '#ffd700',
              border: '2px solid #d4af37',
              borderRadius: '4px',
              padding: '5px 10px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#8b6914',
              fontWeight: '600',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              if (!copied) e.target.style.background = '#ffed4e';
            }}
            onMouseLeave={(e) => {
              if (!copied) e.target.style.background = '#ffd700';
            }}
          >
            {copied ? '✓ Copied' : '🔗 TX'}
          </button>
        )}
      </div>
      <p>{preview}</p>
    </div>
  );
};

export default NoteItem;
