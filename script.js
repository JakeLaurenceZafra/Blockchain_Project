// Get DOM elements
const createNoteBtn = document.getElementById('createNoteBtn');
const createNoteModal = document.getElementById('createNoteModal');
const viewNoteModal = document.getElementById('viewNoteModal');
const noteForm = document.getElementById('noteForm');
const notesList = document.getElementById('notesList');
const cancelBtn = document.getElementById('cancelBtn');
const closeCreateModal = document.querySelector('.close');
const closeViewModal = document.querySelector('.close-view');
const editNoteBtn = document.getElementById('editNoteBtn');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const modalTitle = document.getElementById('modalTitle');
const submitBtn = document.getElementById('submitBtn');

// Load notes from localStorage on page load
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentNoteId = null; // Track which note is being viewed/edited
let currentFilter = 'all'; // Track current filter

// Initialize the app
function init() {
    displayNotes();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Create note button
    createNoteBtn.addEventListener('click', () => {
        currentNoteId = null;
        modalTitle.textContent = 'Create New Note';
        submitBtn.textContent = 'Save';
        createNoteModal.style.display = 'block';
        noteForm.reset();
        document.getElementById('noteTag').value = '';
    });

    // Edit note button
    editNoteBtn.addEventListener('click', () => {
        editNote();
    });

    // Delete note button
    deleteNoteBtn.addEventListener('click', () => {
        deleteNote();
    });

    // Close modals
    closeCreateModal.addEventListener('click', () => {
        createNoteModal.style.display = 'none';
        noteForm.reset();
        document.getElementById('noteTag').value = '';
        currentNoteId = null;
        modalTitle.textContent = 'Create New Note';
        submitBtn.textContent = 'Save';
    });

    closeViewModal.addEventListener('click', () => {
        viewNoteModal.style.display = 'none';
        currentNoteId = null;
    });

    // Cancel button
    cancelBtn.addEventListener('click', () => {
        createNoteModal.style.display = 'none';
        noteForm.reset();
        document.getElementById('noteTag').value = '';
        currentNoteId = null;
        modalTitle.textContent = 'Create New Note';
        submitBtn.textContent = 'Save';
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === createNoteModal) {
            createNoteModal.style.display = 'none';
            noteForm.reset();
            document.getElementById('noteTag').value = '';
            currentNoteId = null;
            modalTitle.textContent = 'Create New Note';
            submitBtn.textContent = 'Save';
        }
        if (e.target === viewNoteModal) {
            viewNoteModal.style.display = 'none';
            currentNoteId = null;
        }
    });

    // Form submission
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveNote();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Set current filter
            currentFilter = btn.getAttribute('data-filter');
            // Display filtered notes
            displayNotes();
        });
    });
}

// Save note (create or update)
function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const tag = document.getElementById('noteTag').value;

    if (title && content && tag) {
        if (currentNoteId) {
            // Update existing note
            const noteIndex = notes.findIndex(n => n.id === currentNoteId);
            if (noteIndex !== -1) {
                notes[noteIndex].title = title;
                notes[noteIndex].content = content;
                notes[noteIndex].tag = tag;
                notes[noteIndex].updatedAt = new Date().toISOString();
            }
        } else {
            // Create new note
            const note = {
                id: Date.now(),
                title: title,
                content: content,
                tag: tag,
                createdAt: new Date().toISOString()
            };
            notes.push(note);
        }

        localStorage.setItem('notes', JSON.stringify(notes));
        
        displayNotes();
        createNoteModal.style.display = 'none';
        noteForm.reset();
        document.getElementById('noteTag').value = '';
        currentNoteId = null;
        modalTitle.textContent = 'Create New Note';
        submitBtn.textContent = 'Save';
    }
}

// Display notes list
function displayNotes() {
    // Filter notes based on current filter
    let filteredNotes = notes;
    if (currentFilter !== 'all') {
        filteredNotes = notes.filter(note => note.tag === currentFilter);
    }

    if (filteredNotes.length === 0) {
        const message = currentFilter === 'all' 
            ? 'No notes yet. Click "Create Note" to add your first note!'
            : `No notes with tag "${currentFilter}" yet.`;
        notesList.innerHTML = `
            <div class="empty-state">
                <h2>No notes found</h2>
                <p>${message}</p>
            </div>
        `;
        return;
    }

    notesList.innerHTML = filteredNotes.map(note => `
        <div class="note-item" onclick="viewNote(${note.id})">
            <div class="note-tag ${getTagClass(note.tag || '')}">${escapeHtml(note.tag || 'No Tag')}</div>
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</p>
        </div>
    `).join('');
}

// Get CSS class for tag
function getTagClass(tag) {
    const tagClasses = {
        'To-Do': 'tag-todo',
        'Reminder': 'tag-reminder',
        'Work': 'tag-work',
        'School': 'tag-school'
    };
    return tagClasses[tag] || 'tag-default';
}

// View note in floating window
function viewNote(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
        currentNoteId = id;
        document.getElementById('viewNoteTitle').textContent = note.title;
        document.getElementById('viewNoteContent').textContent = note.content;
        const tagElement = document.getElementById('viewNoteTag');
        if (note.tag) {
            tagElement.innerHTML = `<span class="note-tag ${getTagClass(note.tag)}">${escapeHtml(note.tag)}</span>`;
            tagElement.style.display = 'block';
        } else {
            tagElement.style.display = 'none';
        }
        viewNoteModal.style.display = 'block';
    }
}

// Edit note
function editNote() {
    if (!currentNoteId) return;
    
    const note = notes.find(n => n.id === currentNoteId);
    if (note) {
        // Close view modal
        viewNoteModal.style.display = 'none';
        
        // Open create/edit modal with note data
        modalTitle.textContent = 'Edit Note';
        submitBtn.textContent = 'Update';
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContent').value = note.content;
        document.getElementById('noteTag').value = note.tag || '';
        createNoteModal.style.display = 'block';
    }
}

// Delete note
function deleteNote() {
    if (!currentNoteId) return;
    
    const note = notes.find(n => n.id === currentNoteId);
    if (note) {
        if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
            notes = notes.filter(n => n.id !== currentNoteId);
            localStorage.setItem('notes', JSON.stringify(notes));
            
            displayNotes();
            viewNoteModal.style.display = 'none';
            currentNoteId = null;
        }
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

