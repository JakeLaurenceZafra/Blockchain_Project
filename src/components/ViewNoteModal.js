import React, { useState } from 'react';

const ViewNoteModal = ({ show, note, onClose, onEdit, onDelete, onPin }) => {
  const [copied, setCopied] = useState(false);

  if (!show || !note) return null;

  const handleCopyTransaction = async () => {
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
        {note.transactionId && (
          <div className="transaction_info" style={{
            marginTop: '15px',
            padding: '10px',
            background: '#e6f7f6',
            borderRadius: '4px',
            border: '1px solid #4ecdc4'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '5px' 
            }}>
              <div style={{ fontSize: '0.9rem', color: '#8b6914', fontWeight: '600' }}>
                Blockchain Transaction:
              </div>
              <button
                onClick={handleCopyTransaction}
                style={{
                  background: copied ? '#4ecdc4' : '#ffd700',
                  border: '2px solid #d4af37',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: '#8b6914',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                title={copied ? 'Copied!' : 'Copy Transaction Hash'}
              >
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <a 
              href={`https://preview.cardanoscan.io/transaction/${note.transactionId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#4ecdc4',
                textDecoration: 'none',
                fontFamily: 'Courier New, monospace',
                fontSize: '0.85rem',
                wordBreak: 'break-all',
                display: 'block',
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '2px',
                marginBottom: '5px'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              {note.transactionId.substring(0, 20)}...{note.transactionId.substring(note.transactionId.length - 10)}
              <span style={{ marginLeft: '5px' }}>🔗</span>
            </a>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>
              Click to view on Cardanoscan
            </div>
          </div>
        )}
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
