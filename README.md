
# 🔥 Prueba_parrilla_App

**Prueba_parrilla_App** es una aplicación web para la gestión de parrilla y mesas. Desarrollada con tecnologías modernas como TypeScript, React y Strapi, esta herramienta permite a los usuarios visualizar y administrar el uso de las mesas, y al administrador controlar la parrilla de manera eficiente.

---

## 🚀 Características

- ✅ **Gestión de mesas**: Visualización de estado, ocupación y liberación de mesas.
- 🔥 **Control de parrilla**: Administración del tiempo y productos en parrilla.
- 📋 **Panel de administración**: Interfaz intuitiva para gestionar recursos del sistema.
- 🧠 **Backend con Strapi**: API RESTful robusta para el manejo de datos.
- 🛠️ **Frontend dinámico**: Interfaz desarrollada con React y TypeScript.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Descripción |
|-----------|-------------|
| **Frontend** | React, TypeScript |
| **Backend** | Strapi (Node.js) |
| **Base de Datos** | postgres |
| **Despliegue** | Render  |

---

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/leoeugenio16/Prueba_parrilla_App.git
cd Prueba_parrilla_App
```

### 2. Instalar dependencias

#### 🔹 Backend (Strapi)

```bash
cd parrilla_db
npm install
```

#### 🔹 Frontend

```bash
cd ../app-parrilla
npm install
```

> Asegúrate de tener ambas carpetas (`app-parrilla` y `parrilla_db`) correctamente estructuradas antes de continuar.

---

## ▶️ Ejecución del proyecto

### 🔹 Iniciar el Backend

```bash
cd parrilla_db
npm run develop
```

### 🔹 Iniciar el Frontend

```bash
cd ../app-parrilla
npm start
```

---

## 🔐 Configuración de entorno

### Backend (`/parrilla_db/.env`)

Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:

```env
DATABASE_URL=postgres://usuario:contraseña@localhost:5432/nombre_basedatos
STRAPI_ADMIN_JWT_SECRET=tu_secreto
```

### Frontend (`/app-parrilla/.env`)

Crea un archivo `.env` en la carpeta `app-parrilla` con la siguiente variable:

```env
REACT_APP_API_URL=http://localhost:1337
```

---

## 🤝 Autor

- Leo Eugenio – [GitHub](https://github.com/leoeugenio16)

---


## 🎞️ imagenes

- **En esta aplicacion se presenta en la pantalla principal todas las mesas disponibles en la parrilla**

![image](https://github.com/user-attachments/assets/0833a938-72e3-4be8-a976-60869362e659)

- **si seleccionamos una mesa, nos va a preguntar si deseamos abrirla entonces en la base de datos se va a setear con el estado de mesa abierta**

![image](https://github.com/user-attachments/assets/d4e0afc7-de2e-4e12-889e-4da61a1cfa2a)


  
