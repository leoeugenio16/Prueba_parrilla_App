"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import DetallePedido from "@/types/detalle_de_pedido";
import Producto from "@/types/productos";
import { Loader2 } from 'lucide-react';
import axios from "axios";
import DetalleProducto from "@/types/DetalleProducto";
import { toZonedTime } from 'date-fns-tz';

const Reservas = () => {
  const { mesa } = useParams(); // Obtener el parámetro de 'mesa' de la URL
  const [pedidoId, setPedidoId] = useState<string | null>(null); // Guardar el 'pedidoId' del query string
  const [detallePedido, setDetallePedido] = useState<DetallePedido | null>(null); // Detalle del pedido
  const [contador, setContador] = useState("00:00"); // Estado para el contador
  const [tipoPago, setTipoPago] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [query, setQuery] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<Producto[]>([]);
  const [cargarProductos, setCargarProductos] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false); // Estado global de carga
  /* const [bgImage, setBgImage] = useState("/imagenMobile.jpg"); //imagen de carga */
  // Define la zona horaria de Argentina
  const zonaHorariaArgentina = 'America/Argentina/Buenos_Aires';
  // Obtener la hora actual
  const horaArgentina = toZonedTime(new Date(), zonaHorariaArgentina);
  const horaCierre = horaArgentina.toISOString();
  const horaApertura = horaArgentina.toISOString();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const pedidoId = queryParams.get("pedidoId");
    setPedidoId(pedidoId);
  }, []);

  useEffect(() => {
    if (pedidoId) {
      obtenerDetallePedido(pedidoId);
    }
  }, [pedidoId]);

  // Función para obtener el detalle del pedido desde la API
  const obtenerDetallePedido = async (documentId: string) => {
    console.log("📡 Obteniendo detalle de pedido con document_id...", documentId);
    try {
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/detalles-de-pedidos?filters[id_pedido][documentId][$eq]=${documentId}&populate=*`
      );
      const datos = await respuesta.json();

      console.log("📩 Respuesta:", respuesta);
      console.log("📊 Datos obtenidos:", datos);

      if (!datos.data || datos.data.length === 0) {
        console.warn("⚠️ No se encontró detalle de pedido. Creando uno nuevo...");

        // 🔍 Buscar la mesa asociada al pedido
        const pedidoRespuesta = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/pedidos?filters[documentId][$eq]=${documentId}&populate=mesa`
        );
        const pedidoDatos = await pedidoRespuesta.json();

        console.log("📩 Respuesta de pedido:", pedidoDatos);

        // Ver la respuesta cruda completa del pedido
        console.log("📊 Respuesta cruda de pedido:", pedidoDatos);

        if (!pedidoDatos || !pedidoDatos.data || pedidoDatos.data.length === 0) {
          console.error("❌ No se encontró el pedido, no se puede asignar mesa automáticamente.");
          return;
        }

        const pedido = pedidoDatos.data[0]; // Tomar el primer pedido

        // Ver los atributos completos del pedido
        console.log("📊 Atributos del pedido:", pedido); // No 'attributes', ya que todo está dentro del objeto principal

        if (!pedido || !pedido.mesa) {
          console.error("❌ No se pudo obtener la mesa del pedido.");
          return;
        }

        // ✅ Obtener el número de mesa correctamente
        const numeroMesa = pedido.mesa.numero_mesa || null;
        if (!numeroMesa) {
          console.error("❌ No hay número de mesa en el pedido.");
          return;
        }

        console.log("✅ Número de mesa obtenido:", numeroMesa);

        // 🛠️ Crear el detalle de pedido
        try {
          await crearDetallePedido(documentId, numeroMesa);
          console.log("✅ Detalle de pedido creado correctamente.");
        } catch (error) {
          console.error("❌ Error al crear el detalle de pedido:", error);
        }
      } else {
        console.log("✅ Detalle de pedido encontrado:", datos.data[0]);
        setDetallePedido(datos.data[0]);
      }
    } catch (error) {
      console.error("❌ Error al obtener detalle de pedido:", error);
    }
  };


  // Función para crear un nuevo detalle de pedido si no se encuentra
  const crearDetallePedido = async (documentId: string, numeroMesa: number) => {
    console.log("📝 Creando detalle de pedido...");
    console.log("📌 Datos a enviar:", {
      id_pedido: documentId, // Usamos directamente documentId sin la necesidad de un objeto {id: documentId}
      hora_apertura: new Date().toISOString(),
      mesa: numeroMesa,
      estado: "abierto",
    });
    try {
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/detalles-de-pedidos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              id_pedido: documentId, // 🔹 Corrección en la relación con el pedido
              hora_apertura: horaApertura,
              mesa: numeroMesa, // 🔹 Se usa numeroMesa en lugar de "mesa"
              estado: "abierto",
            },
          }),
        }
      );

      if (!respuesta.ok) {
        throw new Error(`⚠️ Error al crear el detalle de pedido. Código de estado: ${respuesta.status}`);
      }

      const datos = await respuesta.json();
      console.log("✅ Detalles del pedido creados:", datos);

      if (datos.data) {
        setDetallePedido(datos.data); // Usamos datos.data en lugar de datos.data.attributes

        // Aquí se obtiene el id del detalle creado
        const detalleDocumentId = datos.data.documentId;  // Obtener el id del detalle creado

        // Actualizar el pedido con el id del detalle creado
        const actualizarPedido = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/pedidos/${documentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                detalles_de_pedido: detalleDocumentId, // Asignamos el id del detalle
              },
            }),
          }
        );
        const respuesta = await actualizarPedido.json();

        // Mostrar la respuesta de la actualización
        console.log('Respuesta de la actualización del pedido:', respuesta);

        if (actualizarPedido.ok) {
          console.log('Pedido actualizado correctamente con el detalle ID:', detalleDocumentId);

          // Verificar si el detalle se asignó correctamente
          if (respuesta.data.detalles_de_pedido && respuesta.data.detalles_de_pedido === detalleDocumentId) {
            console.log('El detalle ha sido asignado correctamente al pedido.');
          } else {
            console.log('El detalle no se asignó correctamente.');
          }
        } else {
          console.error('Error al actualizar el pedido:', respuesta);
        }

        console.log("✅ Pedido actualizado con el detalle.");
      } else {
        throw new Error("⚠️ Estructura de datos inesperada: No se encontraron detalles del pedido.");
      }
    } catch (error) {
      console.error("❌ Error al crear detalle de pedido:", error);
    }
  };


  // Función para mostrar el contador de tiempo
  const mostrarContador = () => {
    if (!detallePedido || !detallePedido.hora_apertura) return;

    const horaApertura = new Date(detallePedido.hora_apertura).getTime();

    if (intervalRef.current) clearInterval(intervalRef.current); // Evitar múltiples intervalos

    intervalRef.current = setInterval(() => {
      // Convertimos solo la hora actual a Argentina
      const ahoraArgentina = toZonedTime(new Date(), zonaHorariaArgentina).getTime();
  
      // Calculamos el tiempo transcurrido
      const tiempoTranscurrido = ahoraArgentina - horaApertura;
      const minutos = Math.floor(tiempoTranscurrido / 60000);
      const segundos = Math.floor((tiempoTranscurrido % 60000) / 1000);
  
      setContador(
        `${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`
      );
    }, 1000);
  };
  /*  useEffect(() => {
     const mesaId = detallePedido?.mesa?.documentId; // Suponiendo que tienes el documentId de la mesa
     if (mesaId) {
       const productosGuardados = localStorage.getItem(`productosSeleccionados_mesa_${mesaId}`);
       if (productosGuardados) {
         setProductosSeleccionados(JSON.parse(productosGuardados));
       }
     }
   }, [detallePedido]); // Asegúrate de que detallePedido tenga información actualizada */



  // Buscar productos con la query
  useEffect(() => {
    const fetchProductos = async () => {
      if (query.length > 2) { // Solo buscar si el usuario escribe 3 o más letras
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos?filters[nombre][$containsi]=${query}`
          );
          setProductos(response.data.data); // Actualiza el estado con los productos encontrados
        } catch (error) {
          console.error("Error al buscar productos:", error);
        }
      } else {
        setProductos([]); // Si la búsqueda es muy corta, limpiamos la lista
      }
    };

    fetchProductos();
  }, [query]);

  const obtenerProductosSeleccionados = async (documentId: string | undefined) => {
    try {
      if (!documentId) {
        console.error("❌ Error: `documentId` es undefined o vacío");
        return;
      }

      console.log(`📡 Buscando productos con documentId: ${documentId}`);

      const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/detalles-de-pedidos?filters[documentId][$eq]=${documentId}&populate=detalle_productos.producto`;

      console.log("🔗 URL de la solicitud:", url);

      const respuesta = await fetch(url);
      const datos = await respuesta.json();

      console.log("📥 Respuesta de Strapi:", datos);

      if (!datos.data || datos.data.length === 0) {
        console.warn("⚠️ No se encontraron productos asociados en la API.");
        setProductosSeleccionados([]);  // Asegurarse de que el estado esté vacío si no hay productos
        return;
      }

      // Extraer los productos y cantidades desde la respuesta de Strapi
      const productosConCantidad = datos.data.flatMap((detalle: { detalle_productos: DetalleProducto[]; }) => {
        return detalle.detalle_productos.map((detalleProducto: DetalleProducto) => ({
          ...detalleProducto.producto, // Todos los datos del producto
          cantidad: detalleProducto.cantidad, // Asignar la cantidad del detalle de pedido
        }));
      });

      console.log("✅ Productos asociados extraídos:", productosConCantidad);

      // Actualizar el estado con los productos obtenidos
      setProductosSeleccionados(productosConCantidad);

      console.log("🛒 Estado actualizado con productos seleccionados:", productosConCantidad);
    } catch (error) {
      console.error("❌ Error al obtener productos asociados:", error);
    }
  };
  useEffect(() => {
    // Activa la carga de productos al montar el componente
    if (detallePedido?.documentId && !cargarProductos) {
      setCargarProductos(true);
    }
  }, [detallePedido]);
  useEffect(() => {
    if (detallePedido?.documentId) {
      obtenerProductosSeleccionados(detallePedido.documentId);
    }
  }, [detallePedido?.documentId]);



  // Función para agregar un producto al detalle del pedido en la base de datos
  const agregarProducto = async (detallePedidoId: string | undefined, productoDocumentId: string) => {
    setIsLoading(true);

    try {
      if (!detallePedidoId) {
        console.error("❌ Error: `detallePedidoId` es undefined o vacío");
        return;
      }

      console.log(`📡 Agregando producto al detalle de pedido ${detallePedidoId}`);

      // Verificar si ya tenemos el producto en el estado
      const producto = productos.find((p: Producto) => p.documentId === productoDocumentId);

      if (!producto) {
        console.error("❌ Error: Producto no encontrado en el estado local");
        return;
      }

      const precioProducto = parseInt(producto.precio || "0"); // Asegúrate de que el precio es un número
      const stockDisponible = producto.cantidad || 0; // Usar `cantidad` para obtener el stock disponible

      if (stockDisponible < 1) {
        console.error("❌ No hay suficiente stock disponible");
        alert("¡No hay suficiente stock para agregar este producto!");
        return;
      }

      // Verificar si el producto ya existe en el detalle del pedido
      const respuestaDetallePedido = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/detalles-de-pedidos/${detallePedidoId}?populate=detalle_productos.producto`
      );
      const detallePedidoDatos = await respuestaDetallePedido.json();

      const detalleProductoExistente = detallePedidoDatos.data.detalle_productos.find(
        (detalle: DetalleProducto) => detalle.producto.documentId === productoDocumentId
      );

      if (detalleProductoExistente) {
        // Si el producto ya existe, actualizamos la cantidad
        const nuevaCantidad = detalleProductoExistente.cantidad + 1;
        const subtotal = precioProducto * nuevaCantidad; // Subtotal calculado con el precio y la nueva cantidad

        console.log(`✅ Actualizando detalle de producto con id: ${detalleProductoExistente.documentId}`);

        const respuestaActualizarDetalleProducto = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/detalle-productos/${detalleProductoExistente.documentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                cantidad: nuevaCantidad,
                subtotal: subtotal, // Usamos el subtotal actualizado
              },
            }),
          }
        );

        const detalleProductoActualizado = await respuestaActualizarDetalleProducto.json();

        // Verificar si la actualización fue exitosa
        if (!respuestaActualizarDetalleProducto.ok) {
          console.error("❌ Error al actualizar detalle de producto:", detalleProductoActualizado);
          return;
        }

        console.log("✅ Detalle de producto actualizado correctamente:", detalleProductoActualizado);
        setCargarProductos(true);
      } else {
        // Si el producto no existe, creamos un nuevo detalle de producto
        const subtotal = precioProducto * 1; // Subtotal calculado con el precio y 1 unidad del producto

        console.log("✅ Creando nuevo detalle de producto");

        const respuestaDetalleProducto = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/detalle-productos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                producto: productoDocumentId, // Aquí enviamos el id del producto
                detalles_de_pedido: detallePedidoId, // Aquí enviamos el documentId del detalle de pedido
                cantidad: 1, // Cantidad inicial de 1
                subtotal: subtotal, // Subtotal calculado con el precio y 1 unidad del producto
              },
            }),
          }
        );

        const detalleProductoCreado = await respuestaDetalleProducto.json();

        // Verificar si la creación fue exitosa
        if (!respuestaDetalleProducto.ok) {
          console.error("❌ Error al crear detalle de producto:", detalleProductoCreado);
          return;
        }

        console.log("✅ Detalle de producto creado correctamente:", detalleProductoCreado);
        await obtenerProductosSeleccionados(detallePedidoId);
      }

      // 3️⃣ Actualizamos el stock del producto
      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos/${productoDocumentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            cantidad: stockDisponible - 1, // Restamos 1 del stock
          },
        }),
      });

      console.log("📦 Stock actualizado correctamente");

      // 4️⃣ Actualiza la lista de productos seleccionados si es necesario
      await obtenerProductosSeleccionados(detallePedidoId);
    } catch (error) {
      console.error("❌ Error al agregar producto al detalle de pedido:", error);
    } finally {
      setIsLoading(false);
    }
  };





  // Función para eliminar un producto del detalle del pedido en la base de datos
  const eliminarProducto = async (detallePedidoId: string, productoId: string) => {
    setIsLoading(true);
    try {
      // 1️⃣ Obtener el detalle del producto antes de eliminarlo
      const respuestaDetalle = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/detalles-de-pedidos/${detallePedidoId}?populate=detalle_productos.producto`
      );
      const detalleDatos = await respuestaDetalle.json();

      if (!detalleDatos.data) {
        console.error("❌ Error: No se encontró el detalle de pedido con ese ID");
        return;
      }

      const detalleProductoExistente = detalleDatos.data.detalle_productos.find(
        (detalle: DetalleProducto) => detalle.producto.documentId === productoId
      );

      if (!detalleProductoExistente) {
        console.error("❌ Error: No se encontró el producto en el detalle de pedido");
        return;
      }

      // 2️⃣ Verificar la cantidad del producto en el detalle de pedido
      if (detalleProductoExistente.cantidad === 1) {
        // Si solo hay 1, se elimina el detalle de pedido
        const respuestaEliminacion = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/detalle-productos/${detalleProductoExistente.documentId}`,
          {
            method: "DELETE",
          }
        );

        if (!respuestaEliminacion.ok) {
          console.error("❌ Error al eliminar producto del detalle-productos:", respuestaEliminacion.statusText);
          return;
        }

        console.log("✅ Producto eliminado completamente del detalle de pedido");
        setCargarProductos(true);
      } else {
        // Si hay más de 1, solo se reduce la cantidad en 1
        const nuevaCantidadDetalle = detalleProductoExistente.cantidad - 1;

        await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/detalle-productos/${detalleProductoExistente.documentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              cantidad: nuevaCantidadDetalle,
            },
          }),
        });

        console.log("🔄 Cantidad del detalle de pedido actualizada correctamente");
        setCargarProductos(true);
      }

      // 3️⃣ Actualizar la cantidad del producto en el inventario
      const respuestaProducto = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos/${productoId}`
      );
      const productoDatos = await respuestaProducto.json();

      const nuevaCantidadProducto = productoDatos.data.cantidad + 1;

      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos/${productoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            cantidad: nuevaCantidadProducto,
          },
        }),
      });

      console.log("📦 Cantidad del producto en inventario actualizada correctamente");
      await obtenerProductosSeleccionados(detallePedidoId);
    } catch (error) {
      console.error("❌ Error al eliminar el producto del detalle-productos:", error);
    } finally {
      setIsLoading(false);
    }
  };





  useEffect(() => {
    if (detallePedido) {
      mostrarContador();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current); // Limpiar intervalo al desmontar
    };
  }, [detallePedido]);

  // Función para calcular el tiempo entre apertura y cierre (ahora retorna un número)
  const calcularTiempo = (horaApertura: string): number => {
    const tiempoTranscurrido = new Date().getTime() - new Date(horaApertura).getTime();
    const minutos = Math.floor(tiempoTranscurrido / 60000);
  
    return minutos;
  };

  // Función para actualizar el estado de la mesa con la hora de cierre y tipo de pago
  const cerrarMesa = async () => {
    if (!detallePedido) return;

    const minutos = calcularTiempo(detallePedido.hora_apertura.toString()); // Convierte a string si es necesario
    console.log("Detalle del pedido recibido:", detallePedido);
    console.log("Detalle del pedido - documentId:", detallePedido?.documentId);
    console.log("Detalle del pedido - id_pedido:", detallePedido?.id_pedido);
    console.log("Detalle del pedido - hora_apertura:", detallePedido?.hora_apertura);
    const totalPedido = productosSeleccionados.reduce((total, producto) => {
      const precioNumerico = parseFloat(producto.precio);
      return isNaN(precioNumerico) ? total : total + (precioNumerico * producto.cantidad);
    }, 0);
    setIsLoading(true);
    try {
      // 1️⃣ Primero, actualizamos el detalle de pedido
      const respuestaDetallePedido = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/detalles-de-pedidos/${detallePedido.documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              hora_cierre: horaCierre,
              tiempo: minutos, // Pasamos el número entero
              estado: "cerrado", // Cambiar el estado del detalle de pedido a cerrado
              Detalle_de_pago: tipoPago, // 🆕 Agregamos el tipo de pago seleccionado
              subtotal: totalPedido, // 🆕 Seteamos el subtotal calculado
              mesa: mesa, // 🆕 Seteamos el número de mesa
            },
          }),
        }
      );

      if (!respuestaDetallePedido.ok) {
        const errorData = await respuestaDetallePedido.json();
        console.error("Error al actualizar el detalle del pedido:", errorData);
        throw new Error("Error al cerrar el detalle del pedido");
      }

      const datosDetallePedido = await respuestaDetallePedido.json();
      console.log("Detalle del pedido cerrado correctamente:", datosDetallePedido);
      if (!pedidoId) {
        console.error("❌ No se ha proporcionado un ID de pedido.");
        return;
      }
      // 2️⃣ Actualizamos el estado del pedido
      const respuestaPedido = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/pedidos/${pedidoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              total: totalPedido,  // Establecer el total calculado
              estado: "cerrado", // Cambiar el estado del pedido a cerrado
            },
          }),
        }
      );

      if (!respuestaPedido.ok) {
        throw new Error("Error al actualizar el estado del pedido");
      }

      console.log("Estado del pedido actualizado a cerrado.");
      // 🔍 Buscar el pedido por su documentId y obtener la mesa asociada
      const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/pedidos?filters[documentId][$eq]=${encodeURIComponent(pedidoId)}&populate=mesa`;
      console.log("🔍 URL de consulta:", url);

      const responsePedido = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const dataPedido = await responsePedido.json();

      if (!dataPedido?.data?.length) {
        console.error("❌ No se encontró un pedido para este ID.");
        return;
      }

      // Obtener el documentId de la mesa asociada al pedido
      const mesaDocumentId = dataPedido.data[0].mesa.documentId; // Obtener el documentId de la mesa
      console.log("✅ Mesa encontrada con documentId:", mesaDocumentId);

      // 3️⃣ Ahora actualizamos el estado de la mesa
      const respuestaMesa = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mesas/${mesaDocumentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              estado: "cerrado", // Cambiar el estado de la mesa a cerrado
              pedidos: null, // Desvinculamos todos los pedidos de la mesa
            },
          }),
        }
      );

      if (!respuestaMesa.ok) {
        throw new Error("Error al actualizar el estado de la mesa");
      }

      console.log("Estado de la mesa actualizado a cerrado.");

      // 4️⃣ Redirigir a la página principal
      window.location.href = "/"; // Usamos window.location para redirigir al usuario

    } catch (error) {
      console.log("document id mesa " + detallePedido.mesa)
      console.error("Error al cerrar la mesa:", error);
    } finally {
      setIsLoading(false);
    }
  };
  /* useEffect(() => {
    if (window.innerWidth >= 1024) {
      setBgImage("/imagenPC.jpg");
    }
  }, []); */



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white w-full p-6">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-4xl">
        <div className="p-4 rounded-lg shadow-md w-full border-b-4 border-gray-500">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2 text-center">Detalle de Pedido</h1>
          <p className="text-lg text-yellow-300 mb-1 text-center">Pedido ID: {pedidoId}</p>
          <p className="text-lg text-yellow-300 mb-2 text-center">Mesa: {mesa}</p>
          {detallePedido && (
            <p className="text-2xl font-bold text-yellow-400 text-center">Contador: {contador}</p>
          )}
        </div>
  
        {/* Buscar productos */}
        <div className="p-4 mt-6 rounded-lg shadow-md w-full border border-gray-700 bg-gray-900">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">Buscar Productos</h2>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full p-3 mb-3 border border-gray-600 rounded-lg bg-gray-800 text-yellow-300 font-bold"
          />
          <ul className="bg-gray-800 border border-gray-600 rounded-lg shadow-md">
            {productos.length > 0 ? (
              productos.map((producto: Producto) => (
                <li
                  key={producto.documentId}
                  onClick={() => {
                    agregarProducto(detallePedido?.documentId, producto.documentId);
                    setQuery("");
                    setProductos([]);
                  }}
                  className="p-3 cursor-pointer hover:bg-gray-700 text-yellow-300 font-bold"
                >
                  {producto.nombre} - ${producto.precio} - Disponible {producto.cantidad}
                </li>
              ))
            ) : (
              <li className="p-3 text-gray-500">No se encontraron productos</li>
            )}
          </ul>
        </div>
  
        {/* Productos seleccionados */}
        <div className="p-4 mt-6 rounded-lg shadow-md w-full border border-gray-700 bg-gray-900">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">Productos Seleccionados</h2>
          {productosSeleccionados && productosSeleccionados.length > 0 ? (
            <ul>
              {productosSeleccionados.map((producto, index) => {
                const precioNumerico = parseFloat(producto.precio);
                if (isNaN(precioNumerico)) return null;
                const subtotal = precioNumerico * producto.cantidad;
  
                return (
                  <li
                    key={index}
                    className="py-2 flex justify-between items-center text-yellow-300 font-bold"
                  >
                    {producto.nombre} - ${precioNumerico} x {producto.cantidad} = ${subtotal.toFixed(2)}
                    <button
                      onClick={() => {
                        if (detallePedido?.documentId) {
                          eliminarProducto(detallePedido.documentId, producto.documentId);
                        }
                      }}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg ml-4"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : "❌"}
                    </button>
                  </li>
                );
              })}
  
              <li className="py-2 flex justify-between font-bold text-xl text-yellow-400 border-t border-gray-600 mt-4 pt-2">
                <span>Total:</span>
                <span>
                  $
                  {productosSeleccionados
                    .reduce((total, producto) => {
                      const precioNumerico = parseFloat(producto.precio);
                      return isNaN(precioNumerico)
                        ? total
                        : total + precioNumerico * producto.cantidad;
                    }, 0)
                    .toFixed(2)}
                </span>
              </li>
            </ul>
          ) : (
            <p className="text-gray-400">No hay productos seleccionados</p>
          )}
        </div>
  
        {/* Tipo de pago */}
        <div className="p-4 mt-6 rounded-lg shadow-md w-full border border-gray-700 bg-gray-900">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">Selecciona el tipo de pago</h2>
          <select
            onChange={(e) => setTipoPago(e.target.value)}
            value={tipoPago || ""}
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-yellow-300 font-bold"
          >
            <option value="">Selecciona una opción</option>
            <option value="Efectivo">Efectivo</option>
            <option value="QR">QR</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
          {!tipoPago && (
            <p className="text-red-500 text-sm mt-2">Por favor, selecciona una opción de pago.</p>
          )}
        </div>
  
        {/* Botón de pago */}
        <div className="p-4 mt-6 rounded-lg shadow-md w-full border border-gray-700 bg-gray-900">
          <button
            onClick={cerrarMesa}
            disabled={isLoading || !tipoPago}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg w-full"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Cerrar Mesa y Pagar"}
          </button>
        </div>
      </div>
    </div>
  );

};

export default Reservas;
