# Transaction Classifier Frontend

## Overview
React-based web interface for analyzing and categorizing bank transactions. Features CSV upload, real-time categorization editing, and visual spending analysis.

## Project Structure
```
frontend/
└── Classifier/          # React application root
    ├── public/          # Static assets
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Page components
    │   ├── utils/       # API helpers
    │   └── App.js       # Main component
    ├── package.json       # Dependency management
    └── README.md          # This file
```

## Installation
```bash
npm install
```

## Available Scripts
- `npm start`: Start development server
- `npm run dev`: Alias for npm start
- `npm run build`: Create production build
- `npm test`: Launch test runner

## Environment Variables
Create `.env` with:
```
REACT_APP_API_URL=http://localhost:5176
```

## Deployment
```bash
npm run build && serve -s build
```

## Docker Deployment

1. Build the Docker image:
```bash
docker build -t transaction-classifier-frontend .
```

2. Run the container:
```bash
docker run -p 3000:80 transaction-classifier-frontend
