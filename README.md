# Store Microservices Frontend

Technical test implementation using Vue 3, Vite, Pinia, and Tailwind CSS.

## 🚀 Technical Requirements Fulfilled
- **Vue 3 + Vite**
- **Router + Pinia**
- **States**: loading, empty, error, success handled globally.
- **Error Handling**: Custom messages for 404, 409, 422, and timeouts.
- **Retry Logic**: Automatic and manual retry for network errors.
- **Caching**: Pinia caching with expiration (5 mins).
- **Testing**: Vitest (Unit) and Playwright (E2E).

## 🛠️ Getting Started

### Prerequisites
- Node.js v20+
- Backend running at `http://localhost:8080`

### Installation
```bash
npm install
```

### Running the App
```bash
npm run dev
```

### Running Tests
```bash
# Unit Tests
npm run test:unit

# E2E Tests (Requires dev server running)
npx playwright test
```

## 🐳 Docker Deployment
The frontend can be containerized using the provided Dockerfile (to be created).

### Environment Variables
- `VITE_API_URL`: Base URL for the backend API (Default: http://localhost:8080)

## 📁 Documentation
See the `docs/` directory for:
- [Architecture Diagram (C4)](docs/architecture.md)
- [Technical Decisions](docs/technical_decisions.md)
