# Blockchain Backend

This project is a backend application for a blockchain-based note-taking system. It provides RESTful APIs for user authentication, note management, and wallet interactions.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/blockchain-backend.git
   ```

2. Navigate to the project directory:
   ```
   cd blockchain-backend
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file based on the `.env.example` file and fill in the required environment variables.

## Usage

To start the server, run:
```
npm start
```

The server will run on `http://localhost:3000` by default.

## API Endpoints

- **Authentication**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Log in an existing user

- **Notes**
  - `GET /api/notes` - Retrieve all notes
  - `POST /api/notes` - Create a new note
  - `PUT /api/notes/:id` - Update an existing note
  - `DELETE /api/notes/:id` - Delete a note

- **Wallets**
  - `POST /api/wallets/connect` - Connect a wallet
  - `POST /api/wallets/disconnect` - Disconnect a wallet

## Testing

To run the tests, use:
```
npm test
```

## Environment Variables

The following environment variables are required:

- `DB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT authentication
- `CARDANO_API_URL` - URL for Cardano API

## License

This project is licensed under the MIT License.