# Backend integration contract

The current workspace is a browser prototype because no Node.js project or server runtime existed when the revision began. The frontend is connected through `localStorage` so the workflows can be exercised and refreshed locally.

For production, replace the localStorage functions in `js/common.js`, `js/auth.js`, and `js/schedule.js` with authenticated API calls backed by `database/schema.sql`.

## Required API

- `POST /api/auth/login` and `POST /api/auth/logout`
- `GET /api/departments`
- `GET /api/faculty?departmentId=...`
- `GET /api/rooms?floor=...`
- `POST /api/rooms`, `PUT /api/rooms/:id`, `DELETE /api/rooms/:id`
- `GET /api/schedules?departmentId=...&yearLevel=...`
- `POST /api/schedules` with server-side room/faculty/day conflict checks and FCFS timestamp ordering
- `PUT /api/schedules/:id`, `DELETE /api/schedules/:id`
- `POST /api/schedules/:id/approve`, `POST /api/schedules/:id/reject`
- `POST /api/attendance/qr-scan` validating faculty code, signed QR payload, date/time, and 12-hour expiry
- `GET /api/attendance?departmentId=...`
- `GET /api/classrooms/status`
- `PUT /api/classrooms/:id/status`
- `GET /api/schedules/export` restricted to faculty, admin, and permitted super-admin sessions

## Security requirements

Use Argon2id or bcrypt password hashes, an HTTP-only secure session cookie or short-lived JWT with refresh rotation, server-side role and department authorization on every route, schema validation, parameterized SQL queries, escaped output, signed/time-limited QR payloads, and audit logs for approval and attendance changes. The prototype login values are demo-only and are not database credentials.
