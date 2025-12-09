# Omnistream Studio

A professional multi-account, multi-source streaming platform allowing composition of local files, remote URLs, and devices with comprehensive studio controls.

## Prerequisites

1.  **Node.js**: v18 or higher.
2.  **PostgreSQL**: Local instance or cloud connection string.
3.  **FFmpeg**: Installed on your system and available in the system PATH.

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

1.  Copy the `.env` file (already created) and update `DATABASE_URL` with your local PostgreSQL credentials.
2.  Generate the Prisma Client:
    ```bash
    npx prisma generate
    ```
3.  Push the database schema:
    ```bash
    npx prisma db push
    ```

## Running the App

Start the development server (Frontend + Backend):

```bash
npm run dev
```

-   **Frontend**: http://localhost:5173
-   **Backend**: http://localhost:3000

## Features

-   **Studio**: Compose scenes with Webcams, Screens, and Local Files.
-   **Audio Mixer**: Advanced audio processing (Noise Gate, Gain, Echo Cancellation).
-   **Multistreaming**: Manage destinations and RTMP keys.
-   **Accounts**: OAuth integration structure for YouTube, Twitch, etc.
