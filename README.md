
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

- **si seleccionamos una mesa, nos va a preguntar si deseamos abrirla, entonces en la base de datos se va a setear  el estado de mesa abierta**

![image](https://github.com/user-attachments/assets/d4e0afc7-de2e-4e12-889e-4da61a1cfa2a)

- **Al abrir la mesa nos va a mostrar una pantalla como la siguiente para poder ir hacienod los pedidos en esa mesa**

![image](https://github.com/user-attachments/assets/dca6fa7d-b996-44b5-9be3-cc5098815c77)

- **en el buscador de producto miesntras vamos escribiendo nos va mostrando un listado con los productos de la base de datos en tiempo real**

![image](https://github.com/user-attachments/assets/e3d83365-08c4-4f6d-ab62-6ffc64400ba7)
![image](https://github.com/user-attachments/assets/597f6e75-2ba4-4c0f-9ccb-2e34b6985967)

- **los productos se van seleccionando y se van agregando a la lista donde se van a sumar y generar un total**

![image](https://github.com/user-attachments/assets/f8cdf79e-7d5d-429e-b3a0-3012fbde7833)

- **luego en la seleccion de pago debemos elegir como pago el cliente para poder tener un registro**

![image](https://github.com/user-attachments/assets/fb84a713-3c0b-43ff-834d-9f80d842f26d)

- **si volvemos a la pagina principal sin cerrar la mesa podemos identificar que esa mesa sigue abierta por emdio del color del boton, en este caso la mesa 1**

![image](https://github.com/user-attachments/assets/f5642fb6-f6a5-4c9a-abc6-3234afbe0b4b)

- **ahora si en el navbar vamos a la opcion agregar producto vamos a poder generar un nuevo pordcuto colocando los datos siguientes**

![image](https://github.com/user-attachments/assets/7d9a00fd-ee2c-4d43-85f1-c9702266f9dd)

- **en la seleccion de editar prodcuto vamsoa  tener algo similar, con la diferencia que vamosa  buscar en el input el pordcuto por nombre y al seleccionarlo vamos a poder editar los datos ya establecidos en la base de datos**

![image](https://github.com/user-attachments/assets/ee85dbb0-6f67-4677-a378-c4e5338a73b5)

![image](https://github.com/user-attachments/assets/98218d66-5b7b-4a57-b3d3-703edb793f98)

![image](https://github.com/user-attachments/assets/1155c03f-8d4f-4a94-ad1e-589e320025ab)

- si queremos borrar un pordcuto nos va a aparecer un alert que genera un numero random y el mismo debe ser ingresado para evitar borrar productos sin intencion

![image](https://github.com/user-attachments/assets/fa869e3b-394b-453e-bce0-7343a20b448f)

- **en la session de tablero vamos a ver las mesas que estan abiertas en tiempo real y asi poder ver los pedidos, esto lo usa la persona dentro de la cocina para poder seguir los pedidos, los cuales indican la hopra de apertura para saber que pedido debe salir primero**

![image](https://github.com/user-attachments/assets/7a1674fc-b3cc-477d-8ffc-a8f735ff88b1)

al presionar en ver productos, se despliega la lista de prodcutos

![image](https://github.com/user-attachments/assets/955b9136-cb66-443f-b9c6-51d0ac209b77)

- **En el apartado cierre de caja vamos a tener la opcion de indicar un rango de fechas y horas y asi poder ver todos los pedidos que fueron realizados y pagados en ese lapzo y asi poder calcular cuanto dinero ingreso, mostrando un total general y mostrando un total por tipo de pago**
  
![image](https://github.com/user-attachments/assets/0affbaa4-2d7e-4d56-9cdb-da3ee7abd041)

- **a su vez podemos obtener los detalles de cada pedido**

![image](https://github.com/user-attachments/assets/0882b942-2798-4765-a2ce-7deef8c82120)

- **esta pagina esta protegida con contraseña, donde los mozos solo pueden abri y cargar mesas, y el usuario general tiene acceso a la modificacion de prodcutos**

![image](https://github.com/user-attachments/assets/b8131fa5-c0d8-4df1-b2e6-db1bbf4f8a35)

![image](https://github.com/user-attachments/assets/a7390174-362b-4a79-8331-dd51b8642403)

- ** a su vez esta pagina cuenta con un menu en el cual pueden acceder todas las personas, es decir los comenzales, y esta vinculado a la base de datos, entonces modificando los precios en directamente en la edicion de prodcutos se actualiza en el menu**

![image](https://github.com/user-attachments/assets/e122be62-1497-4e89-a1cf-8e087bbdb59c) ![image](https://github.com/user-attachments/assets/1cf603f6-ca77-4918-8b65-da2eaa4e7c67)






















  
