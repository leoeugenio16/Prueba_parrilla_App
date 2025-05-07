const axios = require('axios');
const readline = require('readline');

// Configuración de la API de Strapi
const urlProductos = 'http://localhost:1337/api/productos';
const urlPedidos = 'http://localhost:1337/api/pedidos';
const urlDetallesDePedido = 'http://localhost:1337/api/detalles-de-pedidos';

// Función para obtener los productos
const obtenerProductos = async () => {
  try {
    const respuesta = await axios.get(urlProductos);
    return respuesta.data;
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    return [];
  }
};

// Función para crear un nuevo pedido
const crearPedido = async () => {
  try {
    const pedido = {
      fecha: new Date(),
      total: 0,
      estado: 'abierto'
    };
    
    const respuesta = await axios.post(urlPedidos, { data: pedido });
    return respuesta.data;
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    return null;
  }
};

// Función para crear un nuevo detalle de pedido con número de mesa
const crearDetalleDePedido = async (idPedido, idProducto, cantidad, subtotal, mesa) => {
  try {
    const detalleDePedido = {
      cantidad,
      subtotal,
      estado: 'abierto',
      mesa, // Agregamos el número de mesa
      id_pedido: { id: idPedido },
      id_productos: { id: idProducto }
    };

    const respuesta = await axios.post(urlDetallesDePedido, { data: detalleDePedido });
    return respuesta.data;
  } catch (error) {
    console.error('Error al crear el detalle de pedido:', error);
    return null;
  }
};

// Función para obtener los detalles de un pedido
const obtenerDetallesDePedido = async (idPedido) => {
  try {
    if (!idPedido) throw new Error('ID de pedido no proporcionado');
    const respuesta = await axios.get(`${urlDetallesDePedido}?populate=id_pedido&filters[id_pedido][id][$eq]=${idPedido}`);
    return respuesta.data;
  } catch (error) {
    console.error('Error al obtener los detalles del pedido:', error);
    return [];
  }
};

// Función principal
const main = async () => {
  const productos = await obtenerProductos();
  const listaProductos = productos.data;

  console.log('Productos:');
  listaProductos.forEach((producto, index) => {
    console.log(`${index + 1}. ${producto.nombre} - ${producto.precio}`);
  });

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  rl.question('Seleccione un producto (ingrese el número): ', async (respuesta) => {
    const index = parseInt(respuesta) - 1;
    const producto = listaProductos[index];

    const pedido = await crearPedido();
    const cantidad = 1;
    const subtotal = producto.precio * cantidad;
    const mesa = 1; // Asignamos la mesa 1
    const detalleDePedido = await crearDetalleDePedido(pedido.data.id, producto.id, cantidad, subtotal, mesa);

    console.log('Pedido creado con éxito:', pedido);
    console.log('Detalle de pedido creado con éxito:', detalleDePedido);

    const detallesDePedido = await obtenerDetallesDePedido(detalleDePedido.data.id);
    console.log('Detalles del pedido:');
    console.log('----------------------------------------------------------------');
    console.log('| ID Pedido | ID Detalle | Cantidad | Subtotal | Estado | Mesa |');
    console.log('----------------------------------------------------------------');
    detallesDePedido.data.forEach((detalle) => {
      console.log(`| ${detalle.id_pedido.id} | ${detalle.id} | ${detalle.cantidad} | ${detalle.subtotal} | ${detalle.estado} | ${detalle.mesa} |`);
    });
    console.log('----------------------------------------------------------------');
    
    rl.close();
  });
};

main();
