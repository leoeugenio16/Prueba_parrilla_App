const axios = require('axios');
const readline = require('readline');

const urlProductos = 'http://localhost:1337/api/productos';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const crearProducto = async () => {
  rl.question('Ingrese el nombre del producto: ', async (nombre) => {
    rl.question('Ingrese la Descripcion del producto: ', async (Descripcion) => {
      rl.question('Ingrese el precio del producto: ', async (precio) => {
        rl.question('Ingrese la cantidad del producto: ', async (cantidad) => {
          const producto = {
            nombre,
            Descripcion,
            precio: precio.toString(), // enviar precio como string
            cantidad: parseInt(cantidad)
          };

          console.log('Producto:', producto);

          try {
            const respuesta = await axios.post(urlProductos, { data: producto });
            console.log('Respuesta:', respuesta);
            console.log('Producto creado con éxito:', respuesta.data);
          } catch (error) {
            console.error('Error al crear el producto:');
            console.error('Error:', error);
            console.error('Error response:', error.response);
            console.error('Error request:', error.request);
          }

          rl.close();
        });
      });
    });
  });
};

crearProducto();