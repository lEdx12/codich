# CODICH — Plataforma Web

> Colegio de Diseñadores Industriales de Chile  
> Ingeniería de Software 2 | NRC 7975 | Primer Semestre 2026  
> Equipo: Eduardo Diaz · Martin Morales · Romina Poblete · Francisca Moraga

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + react-router-dom 6 |
| Backend | Node 20 + Express 4 + Mongoose 8 |
| Base de datos | MongoDB Atlas |
| Auth | JWT (30 min) + bcrypt (12 rounds) |
| Pagos | Flow Sandbox |

---

## Instalación

### 1. Clonar y configurar variables de entorno

```bash
cd server
cp .env.example .env
# Editar .env con tus credenciales reales
```

### 2. Instalar dependencias

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Crear carpeta de uploads (backend)

```bash
mkdir server/uploads
```

### 4. Ejecutar en desarrollo

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:3001/api

---

## Estructura del proyecto

```
codich/
├── client/          # React + Vite
│   └── src/
│       ├── api/         axiosInstance.js
│       ├── components/  auth/ · membresia/ · tutorias/ · admin/
│       ├── context/     AuthContext.jsx
│       ├── hooks/       useAuth.js
│       ├── pages/       Login · Register · Dashboard×3
│       └── routes/      ProtectedRoute.jsx
│
└── server/          # Express + Mongoose
    └── src/
        ├── config/      db.js
        ├── models/      Usuario · Membresia · Pago · Tutoria · Material · Inscripcion
        ├── middleware/  verifyToken · verifyRole · rateLimiter
        ├── controllers/ auth · membresia · instructor · informe · tutoria · material
        ├── routes/      auth · membresia · instructor · informe · tutoria · material
        └── services/    pagoService · emailService · informeService
```

---

## Historias de usuario implementadas

| HU | Descripción | Sprint | Estado |
|---|---|---|---|
| HU-01 | Pago de membresía (Flow Sandbox) | 1 | ✅ |
| HU-02 | Gestión de instructores (admin) | 1 | ✅ |
| HU-03 | Generación de informes PDF/CSV | 1 | ✅ |
| HU-04 | Contratar tutorías | 2 | ✅ |
| HU-05 | Gestión de contenido de tutorías | 2 | ✅ |
| HU-06 | Registro de usuario | 3 | ✅ |
| HU-07 | Inicio de sesión + bloqueo por intentos | 3 | ✅ |
| HU-08 | Búsqueda de tutorías con filtros | 4 | ✅ |

---

## Variables de entorno requeridas (`server/.env`)

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=clave_secreta_larga
JWT_EXPIRES_IN=30m
PORT=3001
CLIENT_URL=http://localhost:5173
FLOW_API_KEY=...
FLOW_SECRET_KEY=...
FLOW_API_URL=https://sandbox.flow.cl/api
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=CODICH <no-reply@codich.cl>
```

---

## Convenciones Git

```
main          → producción
develop       → integración
feature/hu-XX → desarrollo por HU
fix/nombre    → corrección de bugs
```

Commits: `feat(hu-01): descripción`, `fix(hu-07): descripción`, `docs: descripción`
