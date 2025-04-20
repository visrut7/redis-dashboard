# Redis Studio

A simple Redis dashboard to view, search, and delete Redis keys.

## Features

- Connect to a local Redis instance
- View up to 10 key-value pairs
- Search for keys
- Delete Redis keys

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Redis instance running locally (or configure connection details via environment variables)

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd redis-dashboard
```

2. Install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

3. Set up environment variables (optional):

Create a `.env.local` file in the root directory with the following variables:

```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Configuration

The Redis connection details can be configured by environment variables:

- `REDIS_HOST`: Redis server hostname (defaults to 'localhost')
- `REDIS_PORT`: Redis server port (defaults to 6379)
- `REDIS_USERNAME`: Redis username (optional)
- `REDIS_PASSWORD`: Redis password (optional)

## Tech Stack

- Next.js 15
- React 19
- ioredis
- Tailwind CSS
