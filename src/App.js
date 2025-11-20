import React, { useState, useEffect } from 'react';
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

  // Load notes from localStorage on mount
  useEffect(() => {
    if (is_logged_in) {
      const saved_notes = JSON.parse(localStorage.getItem('notes')) || [];
      setNotes(saved_notes);
    }
  }, [is_logged_in]);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowCreateModal(true);
  };

  const handleSaveNote = (note_data) => {
    if (editing_note) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === editing_note.id 
          ? { ...note, ...note_data, updatedAt: new Date().toISOString() }
          : note
      ));
    } else {
      // Create new note
      const new_note = {
        id: Date.now(),
        ...note_data,
        createdAt: new Date().toISOString()
      };
      setNotes([...notes, new_note]);
    }
    setShowCreateModal(false);
    setEditingNote(null);
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

  const handleDeleteNote = () => {
    if (current_note && window.confirm(`Are you sure you want to delete "${current_note.title}"?`)) {
      setNotes(notes.filter(note => note.id !== current_note.id));
      setShowViewModal(false);
      setCurrentNote(null);
    }
  };

  const handlePinNote = () => {
    if (current_note) {
      setNotes(notes.map(note => 
        note.id === current_note.id 
          ? { ...note, pinned: !note.pinned }
          : note
      ));
      // Update current note to reflect pin status
      setCurrentNote({ ...current_note, pinned: !current_note.pinned });
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
    </div>
  );
}

export default App;
