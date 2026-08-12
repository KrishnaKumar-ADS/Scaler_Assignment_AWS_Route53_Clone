# Route53 Management Console Clone

A full-stack, AI-powered simulated AWS Route 53 management console built as a comprehensive technical assignment. This platform allows users to manage their Hosted Zones and DNS Records, view detailed system audit logs, and query a context-aware AI assistant that is securely guardrailed to their specific infrastructure.

## 🚀 Features

- **Authentication**: Secure, session-based mocked authentication system.
- **Hosted Zones**: Full CRUD capabilities for Hosted Zones with `PUBLIC` and `PRIVATE` routing types.
- **DNS Records**: Full CRUD capabilities for DNS Records (A, AAAA, CNAME, TXT, MX) with real-time TTL updates.
- **Data Isolation**: Strict multi-tenant backend architecture ensuring users can only view and modify their own infrastructure.
- **Audit Logging**: An integrated, paginated analytics dashboard tracking every `CREATE`, `UPDATE`, and `DELETE` action performed by the user.
- **AI Assistant**: A chat interface powered by OpenRouter. The AI is injected dynamically with the authenticated user's specific infrastructure data and strictly refuses any prompts unrelated to AWS Route 53 or the user's data.

## 🛠 Tech Stack

- **Backend**: FastAPI, Python 3, SQLAlchemy, SQLite, Pydantic, Passlib.
- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS v4, shadcn/ui.
- **AI Integration**: OpenAI SDK connected to `openrouter/free`.

---

## 💻 Local Setup Instructions

### 1. Backend Setup (FastAPI)

Navigate to the backend directory and set up the Python environment:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:
- **Windows**: `.\venv\Scripts\activate`
- **Mac/Linux**: `source venv/bin/activate`

Install dependencies:
```bash
pip install fastapi uvicorn sqlalchemy pydantic passlib bcrypt openai
```

Populate the database with the mock test data (Generates 50 users with mock Hosted Zones and DNS Records):
```bash
python seed_50_users.py
```

Start the API Server:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*The backend will be running at `http://localhost:8000`. You can view the interactive API documentation at `http://localhost:8000/docs`.*

### 2. Frontend Setup (Next.js)

Open a new terminal window, navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the Next.js development server:
```bash
npm run dev
```
*The frontend will be running at `http://localhost:3000`.*

---

## 🔑 Demo Access

To test the application, navigate to `http://localhost:3000` and sign in with the following seeded credentials:

- **Email:** `user1@example.com`
- **Password:** `password123`

*(Note: The `seed_50_users.py` script created 50 users ranging from `user1@example.com` to `user50@example.com`. All share the same password `password123`.)*

## 🤖 Testing the AI Assistant

1. Login using the demo credentials.
2. Click the **Ask AI** button in the top navigation bar.
3. Try asking: *"How many DNS records do I have?"* (The AI will perfectly parse your data and give you an exact answer based on your specific Hosted Zones).
4. Try asking: *"How do I bake a cake?"* (The AI will strictly refuse the request based on the system guardrails).
