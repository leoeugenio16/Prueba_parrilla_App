// URL de la API de Strapi (ajusta según tu configuración)
const STRAPI_URL = "http://localhost:1337";  // Cambia el puerto si es necesario

// Función para obtener los productos desde la base de datos
async function obtenerProductos() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/productos?populate=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data.data;  // Devuelve la lista de productos
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
}

// Función para crear un nuevo pedido
async function crearPedido(mesa) {
  try {
    console.log(`Creando pedido en ${STRAPI_URL}/api/pedidos`);
    const response = await fetch(`${STRAPI_URL}/api/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          fecha: new Date().toISOString(),
          total: 0,
          estado: 'abierto',
        },
      }),
    });

    console.log(`Respuesta del servidor: ${response.status} ${response.statusText}`);
    if (!response.ok) {
      console.error(`Error al crear pedido: ${response.status} ${response.statusText}`);
      return null;
    }

    const pedido = await response.json();
    console.log(`Pedido creado:`, pedido);
    return pedido.data; // Devuelve los datos del nuevo pedido
  } catch (error) {
    console.error("Error al crear pedido:", error);
    return null; // Retorna null si la creación del pedido falla
  }
}

// Función para crear un detalle de pedido
async function crearDetalleDePedido(pedidoClientId, productosSeleccionados) {
  try {
    const subtotal = productosSeleccionados.reduce((total, producto) => total + parseFloat(producto.precio), 0);

    const response = await fetch(`${STRAPI_URL}/api/detalles-de-pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          id_pedido: pedidoClientId, // Usamos el clientId
          id_productos: productosSeleccionados.map(p => p.id),
          subtotal: subtotal,
          estado: 'abierto',
          hora_apertura: new Date().toISOString(),
          mesa: productosSeleccionados[0].mesa,
        },
      }),
    });

    const detalleDePedido = await response.json();
    return detalleDePedido.data; // Devuelve el detalle de pedido creado
  } catch (error) {
    console.error("Error al crear detalle de pedido:", error);
  }
}

// Función para actualizar el estado del detalle de pedido usando clientId
async function actualizarEstadoDetalleDePedido(documentId, nuevoEstado) {
  const url = `${STRAPI_URL}/api/detalles-de-pedidos/${documentId}`;
  
  const data = {
    estado: nuevoEstado
  };

  // Si el estado es "cerrado", asignamos la hora de cierre
  if (nuevoEstado === "cerrado") {
    data.hora_cierre = new Date().toISOString();
  }

  const respuesta = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data })
  });

  if (!respuesta.ok) {
    console.error(`Error al actualizar estado del detalle de pedido: ${respuesta.status} ${respuesta.statusText}`);
    return null;
  }

  return await respuesta.json();
}

// Función para asignar un detalle de pago
async function asignarDetalleDePago(detalleClientId, metodoPago) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/detalles-de-pedidos/${detalleClientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          Detalle_de_pago: metodoPago,
        },
      }),
    });

    const detalleConPago = await response.json();
    return detalleConPago.data;
  } catch (error) {
    console.error("Error al asignar detalle de pago:", error);
  }
}

// Función para ejecutar el flujo completo de la aplicación
async function flujoCompleto() {
  try {
    // Paso 1: Obtener productos desde la base de datos
    console.log("Obteniendo productos...");
    const productosDisponibles = await obtenerProductos();
    console.log("Productos disponibles:", productosDisponibles);

    // Aquí, se simula que el usuario selecciona dos productos
    const productosSeleccionados = [
      productosDisponibles[0],  // Primer producto
      productosDisponibles[1],  // Segundo producto
    ];

    // Paso 2: Crear un nuevo pedido con mesa 5
    console.log("Creando nuevo pedido...");
    const nuevoPedido = await crearPedido(5);
    if (!nuevoPedido) {
      console.error("No se pudo crear el pedido");
      return;
    }
    console.log("Pedido creado:", nuevoPedido);

    // Paso 3: Crear detalle de pedido con productos seleccionados
    console.log("Creando detalle de pedido...");
    const nuevoDetalleDePedido = await crearDetalleDePedido(nuevoPedido.documentId, productosSeleccionados); // Usamos documentId como clientId
    if (!nuevoDetalleDePedido) {
      console.error("No se pudo crear el detalle de pedido");
      return;
    }
    console.log("Detalle de pedido creado:", nuevoDetalleDePedido);

    // Paso 4: Actualizar el estado del detalle de pedido a 'en_preparacion'
    console.log("Actualizando estado del detalle de pedido a 'en_preparacion'...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Agregar un retraso de 1 segundo
    const detalleActualizado = await actualizarEstadoDetalleDePedido(nuevoDetalleDePedido.documentId, 'en_preparacion'); // Usamos documentId como clientId
    if (!detalleActualizado) {
      console.error("No se pudo actualizar el estado del detalle de pedido");
      return;
    }
    console.log("Detalle de pedido actualizado:", detalleActualizado);

    // Paso 5: Asignar un método de pago cuando el estado sea 'servido'
    console.log("Asignando método de pago...");
    const detalleConPago = await asignarDetalleDePago(nuevoDetalleDePedido.documentId, 'QR');  // Ejemplo de pago con QR
    if (!detalleConPago) {
      console.error("No se pudo asignar el método de pago");
      return;
    }
    console.log("Detalle con pago asignado:", detalleConPago);

    // Paso 6: Finalizar el pedido, cambiar estado a 'pagado' y 'cerrado'
    console.log("Cerrando el pedido...");
    await actualizarEstadoDetalleDePedido(nuevoDetalleDePedido.documentId, 'pagado'); // Usamos documentId como clientId
    const detalleFinalizado = await actualizarEstadoDetalleDePedido(nuevoDetalleDePedido.documentId, 'cerrado'); // Usamos documentId como clientId
    if (!detalleFinalizado) {
      console.error("No se pudo finalizar el pedido");
      return;
    }
    console.log("Pedido finalizado:", detalleFinalizado);

    // Paso 7: Mostrar todos los detalles del pedido y su detalle
    console.log("Detalles del pedido finalizado:");
    const pedidoFinal = {
      id: nuevoPedido.id,
      mesa: nuevoPedido.mesa,
      fecha: nuevoPedido.fecha,
      estado: nuevoPedido.estado,
      detalle: {
        id: nuevoDetalleDePedido.id,
        subtotal: nuevoDetalleDePedido.subtotal,
        estado: detalleFinalizado.estado,
        hora_apertura: nuevoDetalleDePedido.hora_apertura,
        hora_cierre: detalleFinalizado.hora_cierre,
        metodo_pago: detalleConPago.Detalle_de_pago,
      }
    };
    console.log(pedidoFinal);
    // Actualizar estado del pedido a 'cerrado' usando documentId
    const respuestaPedido = await fetch(`${STRAPI_URL}/api/pedidos/${nuevoPedido.documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          estado: 'cerrado',
        },
      }),
    });
    const pedidoCerrado = await respuestaPedido.json();
    console.log('pedidoCerrado:', pedidoCerrado);

    // Mostrar tabla con datos del pedido y su detalle
    console.log("\nPedido finalizado:");
    console.log("=====================================");
    console.log(`ID del pedido: ${pedidoCerrado.data.id}`);
    console.log(`Document ID del pedido: ${pedidoCerrado.data.documentId}`);
    console.log(`Mesa: ${pedidoCerrado.data.mesa}`);
    console.log(`Fecha: ${pedidoCerrado.data.fecha}`);
    console.log(`Estado: ${pedidoCerrado.data.estado}`);
    console.log("Detalle del pedido:");
    console.log(`ID del detalle: ${detalleFinalizado.data.id}`);
    console.log(`Subtotal: ${detalleFinalizado.data.subtotal}`);
    console.log(`Estado: ${detalleFinalizado.data.estado}`);
    console.log(`Hora de apertura: ${detalleFinalizado.data.hora_apertura}`);
    console.log(`Hora de cierre: ${detalleFinalizado.data.hora_cierre}`);
    console.log(`Método de pago: ${detalleFinalizado.data.Detalle_de_pago}`);
    console.log("=====================================");

  } catch (error) {
    console.error("Error en el flujo completo:", error);
  }
}

// Ejecutar el flujo completo
flujoCompleto();
