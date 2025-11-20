# Notes App - React Version

A beautiful notes application with a yellow pad paper design, built with React.

## Features

- Create, view, edit, and delete notes
- Tag notes with: To-Do, Reminder, Work, or School
- Filter notes by tag
- Notes are saved to localStorage
- Beautiful handwritten-style design with yellow pad paper aesthetic

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
NotesAppBC/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── NoteList.js
│   │   ├── NoteItem.js
│   │   ├── CreateNoteModal.js
│   │   └── ViewNoteModal.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Technologies Used

- React 18.2.0
- React DOM
- CSS3 (with custom handwritten fonts)

