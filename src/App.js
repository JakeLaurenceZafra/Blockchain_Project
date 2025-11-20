import React, { useEffect, useState } from 'react';
import { getNotes, createNote, updateNote, deleteNote } from './api';
import Login from './components/Login';
import Registration from './components/Registration';
import Profile from './components/Profile';
import Wallet from './components/Wallet';
import Header from './components/Header';
import NoteList from './components/NoteList';
import CreateNoteModal from './components/CreateNoteModal';
import ViewNoteModal from './components/ViewNoteModal';

function App() {
  const [is_logged_in, setIsLoggedIn] = useState(false);
  const [show_registration, setShowRegistration] = useState(false);
  const [show_profile, setShowProfile] = useState(false);
  const [show_wallet, setShowWallet] = useState(false);
  const [current_user, setCurrentUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [current_filter, setCurrentFilter] = useState('all');
  const [show_create_modal, setShowCreateModal] = useState(false);
  const [show_view_modal, setShowViewModal] = useState(false);
  const [current_note, setCurrentNote] = useState(null);
  const [editing_note, setEditingNote] = useState(null);
  const [error, setError] = useState('');

  // Check if user is logged in on mount and load user data
  useEffect(() => {
    const logged_in = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(logged_in);
    if (logged_in) {
      const user_data = localStorage.getItem('currentUser');
      if (user_data) {
        setCurrentUser(JSON.parse(user_data));
      }
    }
  }, []);

  // Load notes from API on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getNotes();
        setNotes(data || []);
      } catch (err) {
        setError(err.message || 'Could not load notes');
        // fallback: try localStorage
        const local = JSON.parse(localStorage.getItem('notes') || '[]');
        setNotes(local);
      }
    };
    load();
  }, []);

  // Save notes to localStorage whenever notes change (cached copy)
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowCreateModal(true);
  };

  // Helper to normalize id keys from backend
  const getId = (n) => n?.id ?? n?._id ?? null;

  const handleSaveNote = async (note_data) => {
    try {
      if (editing_note) {
        // Update existing note via API
        const payload = {
          title: note_data.title,
          content: note_data.content,
          tag: note_data.tag,
          // keep pinned state if exists
          pinned: editing_note.pinned ? true : false
        };
        const updated = await updateNote(getId(editing_note), payload);
        const updatedId = getId(updated) ?? getId(editing_note);
        setNotes(notes.map(note => (getId(note) === updatedId ? { ...note, ...updated } : note)));
      } else {
        // Create new note via API
        const created = await createNote({
          title: note_data.title,
          content: note_data.content,
          tag: note_data.tag
        });
        // backend returns created note object
        setNotes(prev => [...prev, created]);
      }
      setShowCreateModal(false);
      setEditingNote(null);
    } catch (err) {
      // keep UI unchanged but show error
      setError(err.message || 'Failed to save note');
    }
  };

  const handleViewNote = (note) => {
    setCurrentNote(note);
    setShowViewModal(true);
  };

  const handleEditNote = () => {
    if (current_note) {
      setEditingNote(current_note);
      setShowViewModal(false);
      setShowCreateModal(true);
    }
  };

  const handleDeleteNote = async () => {
    if (current_note && window.confirm(`Are you sure you want to delete "${current_note.title}"?`)) {
      try {
        await deleteNote(getId(current_note));
        setNotes(notes.filter(note => getId(note) !== getId(current_note)));
        setShowViewModal(false);
        setCurrentNote(null);
      } catch (err) {
        setError(err.message || 'Failed to delete note');
      }
    }
  };

  const handlePinNote = async () => {
    if (current_note) {
      try {
        const toggled = !current_note.pinned;
        const payload = {
          title: current_note.title,
          content: current_note.content,
          tag: current_note.tag,
          pinned: toggled
        };
        const updated = await updateNote(getId(current_note), payload);
        const updatedId = getId(updated) ?? getId(current_note);
        setNotes(notes.map(note => (getId(note) === updatedId ? { ...note, ...updated } : note)));
        setCurrentNote(prev => ({ ...prev, pinned: toggled }));
      } catch (err) {
        setError(err.message || 'Failed to toggle pin');
      }
    }
  };

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  const handleLogin = (logged_in) => {
    setIsLoggedIn(logged_in);
    if (logged_in) {
      const user_data = localStorage.getItem('currentUser');
      if (user_data) {
        setCurrentUser(JSON.parse(user_data));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowProfile(false);
  };

  // Filter notes based on current filter
  const filtered_notes = current_filter === 'all' 
    ? notes 
    : notes.filter(note => note.tag === current_filter);

  // Separate pinned and unpinned notes
  const pinned_notes = filtered_notes.filter(note => note.pinned);
  const unpinned_notes = filtered_notes.filter(note => !note.pinned);

  // Show registration page if registration is requested
  if (show_registration) {
    return (
      <Registration 
        onRegister={() => {
          // Registration handled in Registration component
        }}
        onBackToLogin={() => setShowRegistration(false)}
      />
    );
  }

  // Show login page if not logged in
  if (!is_logged_in) {
    return (
      <Login 
        onLogin={handleLogin}
        onShowRegistration={() => setShowRegistration(true)}
      />
    );
  }

  // Show wallet page if requested
  if (show_wallet) {
    return (
      <div className="container">
        <button 
          className="btn_secondary back_button" 
          onClick={(e) => {
            e.preventDefault();
            setShowWallet(false);
          }}
          style={{ 
            margin: '20px', 
            position: 'fixed', 
            top: '20px', 
            left: '20px',
            zIndex: 1000
          }}
        >
          ← Back to Notes
        </button>
        <Wallet />
      </div>
    );
  }

  return (
    <div className="container">
      <Header 
        onFilterChange={handleFilterChange}
        currentFilter={current_filter}
        onShowWallet={() => setShowWallet(true)}
      />
      <Profile
        user={current_user}
        show={show_profile}
        onClose={() => setShowProfile(false)}
        onLogout={handleLogout}
      />
      <div className="create_note_container">
        <button className="btn_primary" onClick={handleCreateNote}>
          Create Note
        </button>
      </div>
      {pinned_notes.length > 0 && (
        <div className="pinned_section">
          <h2 className="section_title">Pinned Notes</h2>
          <NoteList 
            notes={pinned_notes}
            onViewNote={handleViewNote}
            currentFilter={current_filter}
          />
        </div>
      )}
      {unpinned_notes.length > 0 && (
        <div className="notes_section">
          {pinned_notes.length > 0 && <h2 className="section_title">All Notes</h2>}
          <NoteList 
            notes={unpinned_notes}
            onViewNote={handleViewNote}
            currentFilter={current_filter}
          />
        </div>
      )}
      {filtered_notes.length === 0 && (
        <div className="empty_state">
          <h2>No notes found</h2>
          <p>
            {current_filter === 'all' 
              ? 'No notes yet. Click "Create Note" to add your first note!'
              : `No notes with tag "${current_filter}" yet.`}
          </p>
        </div>
      )}
      <CreateNoteModal
        show={show_create_modal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        editingNote={editing_note}
      />
      <ViewNoteModal
        show={show_view_modal}
        note={current_note}
        onClose={() => {
          setShowViewModal(false);
          setCurrentNote(null);
        }}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
        onPin={handlePinNote}
      />
      <button 
        className="wallet_button_circle" 
        onClick={() => setShowWallet(true)}
        title="Wallet"
      >
        💳
      </button>
      <button 
        className="profile_button_circle" 
        onClick={() => setShowProfile(true)}
        title="Profile"
      >
        👤
      </button>
      {error && <div style={{color:'red', marginTop:10}}>{error}</div>}
    </div>
  );
}

export default App;
