import React, { useEffect, useState } from 'react';
import { getNotes, createNote, updateNote, deleteNote } from './api';
import { useWallet } from './contexts/WalletContext';
import { createProvider, sendTransaction } from './utils/blockchain';
import Profile from './components/Profile';
import Wallet from './components/Wallet';
import Header from './components/Header';
import NoteList from './components/NoteList';
import CreateNoteModal from './components/CreateNoteModal';
import ViewNoteModal from './components/ViewNoteModal';

function App() {
  const { isConnected, walletAddress, getWalletApi, disconnectWallet } = useWallet();
  const [show_profile, setShowProfile] = useState(false);
  const [current_user, setCurrentUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [current_filter, setCurrentFilter] = useState('all');
  const [show_create_modal, setShowCreateModal] = useState(false);
  const [show_view_modal, setShowViewModal] = useState(false);
  const [current_note, setCurrentNote] = useState(null);
  const [editing_note, setEditingNote] = useState(null);
  const [error, setError] = useState('');
  const [blockchain_status, setBlockchainStatus] = useState('');

  // Derive the "user" from the connected wallet
  useEffect(() => {
    if (isConnected && walletAddress) {
      const walletUser = {
        name: 'Wallet User',
        username: walletAddress,
        cardanoAddress: walletAddress
      };
      setCurrentUser(walletUser);
      localStorage.setItem('currentUser', JSON.stringify(walletUser));
    } else {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    }
  }, [isConnected, walletAddress]);

  // Load notes from API when wallet is connected
  useEffect(() => {
    if (!isConnected || !walletAddress) {
      setNotes([]);
      return;
    }
    
    const load = async () => {
      try {
        console.log('Loading notes from API...');
        const data = await getNotes();
        console.log('Notes loaded:', data);
        setNotes(data || []);
      } catch (err) {
        console.error('Error loading notes:', err);
        setError(err.message || 'Could not load notes');
        // fallback: try localStorage
        const local = JSON.parse(localStorage.getItem('notes') || '[]');
        console.log('Using localStorage fallback:', local);
        setNotes(local);
      }
    };
    load();
  }, [isConnected, walletAddress]);

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
      setError('');
      if (editing_note) {
        // Update existing note via API
        const payload = {
          title: note_data.title,
          content: note_data.content,
          tag: note_data.tag,
          // keep pinned state if exists
          pinned: editing_note.pinned ? true : false,
          status: 'Pending'
        };
        const updated = await updateNote(getId(editing_note), payload);
        const updatedId = getId(updated) ?? getId(editing_note);
        setNotes(notes.map(note => (getId(note) === updatedId ? { ...note, ...updated } : note)));

        // Fire blockchain tx with metadata
        if (isConnected && walletAddress) {
          try {
            setBlockchainStatus('Submitting update transaction...');
            const walletApi = await getWalletApi();
            const txHash = await sendTransaction({
              provider: createProvider(),
              walletApi,
              targetAddress: walletAddress,
              noteContent: note_data.content,
              noteTitle: note_data.title,
              noteTag: note_data.tag,
              noteId: updatedId,
              action: 'update'
            });
            const finalized = await updateNote(updatedId, { transactionId: txHash, txHash, status: 'Submitted' });
            setNotes(prev => prev.map(note => (getId(note) === updatedId ? { ...note, ...finalized } : note)));
            setBlockchainStatus(`Update tx submitted: ${txHash.slice(0, 12)}...`);
          } catch (blockchainError) {
            console.error('Update blockchain tx failed:', blockchainError);
            setBlockchainStatus('Update saved, but blockchain tx failed.');
          } finally {
            setTimeout(() => setBlockchainStatus(''), 5000);
          }
        }
      } else {
        // Create new note via API (transactionId will be added after blockchain transaction)
        const created = await createNote({
          title: note_data.title,
          content: note_data.content,
          tag: note_data.tag,
          status: 'Pending'
        });
        // backend returns created note object
        setNotes(prev => [...prev, created]);

        // Create blockchain transaction for new notes (only if wallet is connected)
        console.log('Wallet status:', { isConnected, walletAddress, hasWallet: !!walletAddress });
        
        if (isConnected && walletAddress) {
          try {
            setBlockchainStatus('Creating blockchain transaction...');
            const walletApi = await getWalletApi();
            console.log('Wallet API:', walletApi ? 'Available' : 'Not available');
            
            if (walletApi) {
              const txHash = await sendTransaction({
                provider: createProvider(),
                walletApi,
                targetAddress: walletAddress,
                noteContent: note_data.content,
                noteTitle: note_data.title,
                noteTag: note_data.tag,
                noteId: getId(created),
                action: 'create'
              });

              setBlockchainStatus(`Note recorded on blockchain! Transaction: ${txHash.substring(0, 16)}...`);
              const noteId = getId(created);

              if (noteId) {
                try {
                  const updated = await updateNote(noteId, { transactionId: txHash, txHash, status: 'Submitted' });
                  setNotes(prev => prev.map(note => (getId(note) === noteId ? { ...note, ...updated } : note)));
                  // Refresh notes from server to ensure we have the latest data
                  setTimeout(async () => {
                    try {
                      const allNotes = await getNotes();
                      setNotes(allNotes || []);
                      console.log('Refreshed notes from server');
                    } catch (refreshError) {
                      console.error('Failed to refresh notes:', refreshError);
                    }
                  }, 1000);
                } catch (updateError) {
                  console.error('Failed to update note with transaction ID:', updateError);
                  setBlockchainStatus(`Transaction created (${txHash.substring(0, 16)}...) but failed to save ID. Check console.`);
                }
              }
              setTimeout(() => setBlockchainStatus(''), 5000);
            } else {
              setBlockchainStatus('Wallet connection lost. Note saved but not recorded on blockchain.');
              setTimeout(() => {
                setBlockchainStatus('');
              }, 5000);
            }
          } catch (blockchainError) {
            console.error('Blockchain transaction failed:', blockchainError);
            setBlockchainStatus('Note saved, but blockchain transaction failed. Please check your wallet connection.');
            setTimeout(() => {
              setBlockchainStatus('');
            }, 5000);
            // Don't throw - note was already created successfully
          }
        } else {
          // Wallet not connected - note is still saved, just not on blockchain
          console.log('Wallet not connected - note saved without blockchain transaction');
          console.log('Connection status:', { isConnected, walletAddress: walletAddress || 'No address' });
        }
      }
      setShowCreateModal(false);
      setEditingNote(null);
    } catch (err) {
      // keep UI unchanged but show error
      setError(err.message || 'Failed to save note');
      setBlockchainStatus('');
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
        setError('');
        const noteId = getId(current_note);
        // Mark as pending delete locally
        setNotes(prev => prev.map(n => (getId(n) === noteId ? { ...n, status: 'Pending Delete' } : n)));

        if (isConnected && walletAddress) {
          const walletApi = await getWalletApi();
          try {
            setBlockchainStatus('Submitting delete transaction...');
            await sendTransaction({
              provider: createProvider(),
              walletApi,
              targetAddress: walletAddress,
              noteContent: current_note.content,
              noteTitle: current_note.title,
              noteTag: current_note.tag,
              noteId,
              action: 'delete'
            });
            setBlockchainStatus('');
          } catch (chainErr) {
            console.error('Delete blockchain tx failed:', chainErr);
            const msg =
              (chainErr && chainErr.message) ||
              (typeof chainErr === 'string' ? chainErr : 'Unknown error');
            setBlockchainStatus(`Delete tx failed: ${msg}`);
            // revert pending state since delete did not happen on-chain
            setNotes(prev => prev.map(n => (getId(n) === noteId ? { ...n, status: current_note.status || '' } : n)));
            throw chainErr;
          }
        }

        await deleteNote(noteId);
        setNotes(prev => prev.filter(note => getId(note) !== noteId));
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

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    disconnectWallet();
    setCurrentUser(null);
    setNotes([]);
    setShowProfile(false);
  };

  // Filter notes based on current filter
  const filtered_notes = current_filter === 'all' 
    ? notes 
    : notes.filter(note => note.tag === current_filter);

  // Separate pinned and unpinned notes
  const pinned_notes = filtered_notes.filter(note => note.pinned);
  const unpinned_notes = filtered_notes.filter(note => !note.pinned);

  // Require a wallet connection for all note features
  if (!isConnected) {
    return (
      <div className="container">
        <div className="empty_state">
          <h2>Connect your wallet to access notes</h2>
          <p>Your wallet is now the only authentication method.</p>
        </div>
        <Wallet />
      </div>
    );
  }

  return (
    <div className="container">
      <Header 
        onFilterChange={handleFilterChange}
        currentFilter={current_filter}
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
        className="profile_button_circle" 
        onClick={() => setShowProfile(true)}
        title="Profile"
      >
        👤
      </button>
      {error && <div style={{color:'red', marginTop:10, padding:'10px', background:'#ffe6e6', borderRadius:'4px', margin:'10px'}}>{error}</div>}
      {blockchain_status && (
        <div style={{
          color: blockchain_status.includes('failed') ? '#ff6b6b' : '#4ecdc4',
          marginTop: 10,
          padding: '10px',
          background: blockchain_status.includes('failed') ? '#ffe6e6' : '#e6f7f6',
          borderRadius: '4px',
          margin: '10px',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          {blockchain_status}
        </div>
      )}
    </div>
  );
}

export default App;
