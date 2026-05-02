# Sistema de Préstamo de Herramientas

Sistema fullstack para gestionar préstamos de herramientas en una comunidad (torres/apartamentos).

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior

---

## Instalación y ejecución

### 1. Backend (puerto 3001)

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend (puerto 5173)

```bash
cd frontend
npm install
npm run dev
```

Abrir en el navegador: http://localhost:5173

---

## Estructura del proyecto

```
├── backend/
│   ├── src/
│   │   ├── controllers/        # Manejo de peticiones HTTP
│   │   ├── services/           # Lógica de negocio + queries SQLite
│   │   ├── routes/             # Definición de rutas Express
│   │   ├── models/             # Definiciones de esquema
│   │   ├── database.js         # Configuración SQLite (crea el .db automáticamente)
│   │   └── index.js            # Servidor Express
│   ├── data/                   # Archivo .db generado en el primer arranque
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js          # Llamadas al backend con axios
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Resumen con tarjetas de estadísticas
│   │   │   ├── Herramientas.jsx# CRUD de herramientas
│   │   │   ├── Prestamos.jsx   # Registro y listado de préstamos
│   │   │   └── Alertas.jsx     # Préstamos vencidos destacados
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## Endpoints API

### Herramientas
| Método | Ruta                  | Descripción           |
|--------|-----------------------|-----------------------|
| GET    | /herramientas         | Listar todas          |
| GET    | /herramientas/:id     | Obtener una           |
| POST   | /herramientas         | Crear                 |
| PUT    | /herramientas/:id     | Editar                |
| DELETE | /herramientas/:id     | Eliminar              |

### Préstamos
| Método | Ruta                       | Descripción              |
|--------|----------------------------|--------------------------|
| GET    | /prestamos                 | Listar todos             |
| POST   | /prestamos                 | Registrar préstamo       |
| PUT    | /prestamos/:id/devolver    | Registrar devolución     |
| GET    | /prestamos/vencidos        | Listar vencidos          |

### Informes
| Método | Ruta              | Descripción                          |
|--------|-------------------|--------------------------------------|
| GET    | /informes/resumen | Totales: herramientas, activos, etc. |

---

## Variables de entorno

**backend/.env**
```
PORT=3001
```

**frontend/.env**
```
VITE_API_URL=http://localhost:3001
```

---

## Reglas de negocio

- No se puede prestar una herramienta con `cantidad_disponible = 0`
- Crear préstamo reduce `cantidad_disponible` en 1 (transacción atómica)
- Devolver aumenta `cantidad_disponible` en 1 (transacción atómica)
- Los préstamos con `fecha_fin` anterior a hoy se marcan automáticamente como `vencido`
- No se puede eliminar una herramienta con préstamos activos o vencidos
