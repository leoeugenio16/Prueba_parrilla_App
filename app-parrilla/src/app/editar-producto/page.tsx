"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import Producto from "@/types/productos";
import ProtectedPage from '../components/ProtectedPage';
import { useRouter } from "next/navigation";


const ModificarProducto = () => {
  const [search, setSearch] = useState(""); // Estado para búsqueda
  const [productos, setProductos] = useState([]); // Productos encontrados
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null); // Producto seleccionado para modificar
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  /* const [bgImage, setBgImage] = useState(""); */
  const router = useRouter();
  const nombresPermitidos = ['celeste', 'otroNombre', 'otroNombreMas']; // Agrega los nombres que permites
  const checkAuth = () => {
    const token = localStorage.getItem('jwt');
    const usuario = localStorage.getItem('usuario');
  
    /* console.log('Token:', token);
    console.log('Usuario:', usuario); */
  
    if (!token || !usuario) {
      router.push('/login');
      return false;
    }
  
    try {
      const parsedUser = JSON.parse(usuario);
  
  
      if (!nombresPermitidos.includes(parsedUser.username.toLowerCase())) {
        /* console.log('No autorizado'); */
        alert('Usuario sin permiso. Por favor, ingrese datos del usuario autorizado.');
        router.push('/login');
        return false;
      }
  
      /* console.log('Autenticado y autorizado'); */
      return true;
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
      return false;
    }
  };
  const tipos = [
    "COMIDAS",
    "AGUAS Y GASEOSAS",
    "ESPIRITUOSAS Y APERITIVOS",
    "VINOTECA CLASICA",
    "BODEGA CONO SUR",
    "BODEGA TRIVENTO",
    "BODEGA NORTON",
    "BODEGA EL ESTECO",
    "BODEGA MOSQUITA MUERTA",
    "BODEGA FINCA LAS MORAS",
    "BODEGA LA CELIA",
    "CERVEZAS",
    "VINOS ESPUMANTES",
    "SIDRAS",
    "CAFETERÍA",
  ];

 // Función para buscar productos por nombre en tiempo real
 useEffect(() => {
  const fetchProductos = async () => {
    if (search.length > 2) { // Solo buscar si el usuario escribe 3+ letras
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos?filters[nombre][$containsi]=${search}`
        );
        setProductos(response.data.data);
      } catch (error) {
        console.error("Error al buscar productos:", error);
      }
    } else {
      setProductos([]);
    }
  };

  fetchProductos();
}, [search]);

// Función para seleccionar un producto de la lista
const handleSelectProducto = (producto: Producto) => {
  /* console.log(producto) */
  setProductoSeleccionado({
    ...producto, // Copia los valores existentes
    tipo: producto.tipo || "COMIDAS", // Si no tiene tipo, asignar un valor por defecto
  });
  setSearch(""); // Limpiar la búsqueda al seleccionar un producto
  setProductos([]); // Limpiar resultados
};

// Función para actualizar los datos del producto
const handleUpdateProducto = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!productoSeleccionado) return;

  setLoading(true);
  setSuccessMessage("");
  setErrorMessage("");

  try {
    await axios.put(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos/${productoSeleccionado.documentId}`,
      {
        data: {
          nombre: productoSeleccionado.nombre,
          Descripcion: productoSeleccionado.Descripcion,
          precio: productoSeleccionado.precio.toString(),
          cantidad: productoSeleccionado.cantidad,
          tipo: productoSeleccionado.tipo,
        },
      }
    );

    /* setSuccessMessage("Producto actualizado con éxito"); */
    setProductoSeleccionado(null);
  } catch (error) {
    setErrorMessage("Error al actualizar el producto" + error);
    /* console.error("Error al actualizar producto:", error); */
  } finally {
    setLoading(false);
  }
};
/* useEffect(() => {
  const newBgImage = window.innerWidth >= 1024 ? "/imagenPC.jpg" : "/imagenMobile.jpg";
  setBgImage(newBgImage);
}, []); */
const handleDeleteProducto = async () => {
  if (!productoSeleccionado) return;

  // Generar un número aleatorio entre 1 y 99
  const numeroAleatorio = Math.floor(Math.random() * 99) + 1;

  // Mensaje de confirmación con el número aleatorio
  const mensajeConfirmacion = `⚠️ Atención:\n\nPara confirmar que querés borrar este producto, ingresa el siguiente número:\n\n${numeroAleatorio}\n\n(Esto es para evitar borrados accidentales)`;

  const confirmNumero = window.prompt(mensajeConfirmacion);

  // Verificar si el número ingresado es correcto
  // Verificamos que no sea null y que el número coincida
  if (!confirmNumero || parseInt(confirmNumero) !== numeroAleatorio) {
    alert("El número no coincide o fue cancelado. Operación cancelada.");
    return;
  }

  // Si el número coincide, proceder con la eliminación
  try {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos/${productoSeleccionado.documentId}`
    );
    alert("Producto eliminado con éxito.");
    setProductoSeleccionado(null);
    setSearch("");
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    alert("Hubo un error al eliminar el producto.");
  }
};
return (
  <ProtectedPage checkAuth={checkAuth}>
    <div className="page-producto">
      {/* Buscar producto */}
      <div className="mb-6">
        <h1 className="title">Modificar Producto</h1>
        <div className="divider"></div>
        <label className="label">Buscar Producto</label>
        <input
          type="text"
          placeholder="Escribe el nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
      </div>

      {/* Lista de productos encontrados */}
      {productos.length > 0 && (
        <ul className="result-list">
          {productos.map((producto: Producto) => (
            <li
              key={producto.documentId}
              onClick={() => handleSelectProducto(producto)}
              className="result-item"
            >
              {producto.nombre}
            </li>
          ))}
        </ul>
      )}

      {/* Formulario de modificación */}
      {productoSeleccionado && (
        <form onSubmit={handleUpdateProducto} className="space-y-6 mt-6">
          <div>
            <label className="label">Nombre</label>
            <input
              type="text"
              value={productoSeleccionado.nombre}
              disabled
              className="input"
            />
          </div>

          <div>
            <label className="label">Descripción</label>
            <input
              type="text"
              value={productoSeleccionado.Descripcion}
              onChange={(e) =>
                setProductoSeleccionado({
                  ...productoSeleccionado,
                  Descripcion: e.target.value,
                })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Precio</label>
            <input
              type="number"
              value={productoSeleccionado.precio}
              onChange={(e) =>
                setProductoSeleccionado({
                  ...productoSeleccionado,
                  precio: e.target.value,
                })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Cantidad</label>
            <input
              type="number"
              value={productoSeleccionado.cantidad}
              onChange={(e) =>
                setProductoSeleccionado({
                  ...productoSeleccionado,
                  cantidad: parseInt(e.target.value, 10),
                })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Tipo</label>
            <select
              value={productoSeleccionado.tipo || ""}
              onChange={(e) =>
                setProductoSeleccionado({
                  ...productoSeleccionado,
                  tipo: e.target.value,
                })
              }
              className="select"
            >
              {tipos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Botón de guardar cambios */}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
            <button
              type="button"
              onClick={handleDeleteProducto}
              className="btn bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              Eliminar Producto
            </button>

          {/* Mensajes */}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
        </form>
      )}
    </div>
  </ProtectedPage>
);


};

export default ModificarProducto;