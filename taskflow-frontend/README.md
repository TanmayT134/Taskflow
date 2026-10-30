# Taskflow Frontend

Responsive React + JavaScript frontend for the Taskflow Spring Boot REST API.

## Run locally
1. Install Node.js 18+.
2. Start your Spring Boot backend on port 8080.
3. Run `npm install`.
4. Optional: copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.
5. Run `npm run dev` and open http://localhost:5173.

Build with `npm run build`.

Expected API: `GET /tasks`, `GET /tasks/stats`, `POST /tasks`, `PUT /tasks/{id}`, `PATCH /tasks/{id}/completion` with `{completed}`, and `DELETE /tasks/{id}`. List response is expected to contain `content`, `pageNumber`, `totalPages`, and `totalElements`.
