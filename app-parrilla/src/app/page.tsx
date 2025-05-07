"use client"
import axios from 'axios';
import { useState, useEffect } from 'react';
import Mesa from '../types/mesa';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';
import Pedido from '@/types/pedidos';
import { toZonedTime } from 'date-fns-tz';
import ProtectedPage from './components/ProtectedPage';

const Mesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [bgImage, setBgImage] = useState("");
  const zonaHorariaArgentina = 'America/Argentina/Buenos_Aires';
  const horaArgentina = toZonedTime(new Date(), zonaHorariaArgentina);
  const horaApertura = horaArgentina.toISOString();
  const checkAuth = () => {
    const token = localStorage.getItem('jwt');
    const usuario = localStorage.getItem('usuario');

    if (token && usuario) {
      try {
        const parsedUser = JSON.parse(usuario);
        console.log('Usuario autenticado:', parsedUser);
        return true;
      } catch (error) {
        console.error('Error al parsear el usuario:', error);
      }
    }

    console.log('Usuario no autenticado');
    return false; // Regresar false cuando el usuario no esté autenticado
  };

  const abrirMesa = async () => {
    if (!mesaSeleccionada) {
      console.log('❌ No hay mesa seleccionada');
      return;
    }

    console.log('📌 Mesa seleccionada:', mesaSeleccionada);
    setCargando(true);
    try {
      // 1️⃣ Buscar la mesa con sus pedidos (populate)
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mesas/${mesaSeleccionada.documentId}?populate=pedidos`
      );
      const mesaEncontrada = data.data;
      console.log("mesa encontrada " + mesaEncontrada.documentId)

      if (!mesaEncontrada) {
        console.log('❌ No se encontró la mesa');
        return;
      }

      console.log('✔ Mesa encontrada:', mesaEncontrada);

      // 2️⃣ Buscar si ya tiene un pedido activo
      let pedidoActivo = mesaEncontrada.pedidos.find(
        (pedido: { estado: string; }) => pedido.estado === 'abierto'
      );

      if (pedidoActivo) {
        console.log('La mesa ya tiene un pedido activo:', pedidoActivo);

        // Verificar si el pedido activo tiene un detalle de pedido asignado
        if (pedidoActivo.detalles_de_pedido) {
          console.log('El pedido activo ya tiene un detalle de pedido asignado:', pedidoActivo.detalles_de_pedido);
        } else {
          // Crear el detalle de pedido
          const detallesPedido = {
            data: {
              estado: 'abierto',
              hora_apertura: new Date().toISOString(),
            },
          };

          const respuestaCrearDetalles = await axios.post(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/detalles-de-pedidos`,
            detallesPedido
          );

          const nuevoDetallePedido = respuestaCrearDetalles.data.data;
          console.log('Detalles del pedido creados:', nuevoDetallePedido);

          // Asignar el detalle de pedido al pedido activo
          await axios.put(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/pedidos/${pedidoActivo.documentId}`,
            {
              data: {
                detalles_de_pedido: nuevoDetallePedido.documentId,
              },
            }
          );

          console.log('Pedido actualizado con el detalle de pedido:', nuevoDetallePedido);
        }
        // Actualizar la mesa y redirigir
        console.log('Actualizando la mesa con el nuevo pedido...');
        await axios.put(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mesas/${mesaEncontrada.documentId}`,
          {
            data: {
              estado: 'abierto',
              pedidos: [
                ...mesaEncontrada.pedidos.map((p: { documentId: Pedido; }) => p.documentId),
                pedidoActivo.documentId,
              ],
            },
          }
        );

        console.log('Mesa actualizada.');

        await setMesas(
          mesas.map((mesa) =>
            mesa.documentId === mesaEncontrada.documentId
              ? { ...mesa, estado: 'abierto' }
              : mesa
          )
        );

        window.location.href = `/reservas/${mesaSeleccionada.numero_mesa}?pedidoId=${pedidoActivo.documentId}`;
      } else {
        // Si no hay pedido activo, creamos un nuevo pedido
        console.log('No hay pedido activo. Creando nuevo pedido...');

        const respuestaCrearPedido = await axios.post(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/pedidos`,
          {
            data: {
              fecha: horaApertura,
              estado: 'abierto',
              mesa: mesaSeleccionada.documentId, // Relacionamos con documentId de la mesa
            },
          }
        );

        const nuevoPedido = respuestaCrearPedido.data.data;
        console.log('Pedido creado:', nuevoPedido);

        // Crear el detalle de pedido
        const detallesPedido = {
          data: {
            estado: 'abierto',
            hora_apertura: horaApertura,
          },
        };

        const respuestaCrearDetalles = await axios.post(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/detalles-de-pedidos`,
          detallesPedido
        );

        const nuevoDetallePedido = respuestaCrearDetalles.data.data;
        console.log('Detalles del pedido creados:', nuevoDetallePedido);

        // Asignar el detalle de pedido al nuevo pedido
        await axios.put(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/pedidos/${nuevoPedido.documentId}`,
          {
            data: {
              detalles_de_pedido: nuevoDetallePedido.documentId,
            },
          }
        );

        console.log('Pedido actualizado con el detalle de pedido:', nuevoDetallePedido);

        // Ahora se le asigna el nuevo pedido a la mesa
        mesaEncontrada.pedidos.push(nuevoPedido.documentId);
        pedidoActivo = nuevoPedido;  // Aseguramos que `pedidoActivo` ahora tenga el nuevo pedido
      }

      // **Ahora aseguramos que la mesa se actualice a "abierta"**
      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mesas/${mesaEncontrada.documentId}`,
        {
          data: {
            estado: 'abierto',  // Aquí marcamos explícitamente la mesa como "abierta"
            pedidos: mesaEncontrada.pedidos, // Asignamos los pedidos existentes (incluyendo el nuevo)
          },
        }
      );

      console.log('Mesa actualizada a "abierta".');

      // Actualizamos el estado local de la mesa
      await setMesas(
        mesas.map((mesa) =>
          mesa.documentId === mesaEncontrada.documentId
            ? { ...mesa, estado: 'abierto' }
            : mesa
        )
      );


      window.location.href = `/reservas/${mesaSeleccionada.numero_mesa}?pedidoId=${pedidoActivo.documentId}`;
    } catch (error) {
      console.error('❌ Error al abrir mesa:', error);
    } finally {
      setCargando(false); // Desactivar el estado de carga
    }
  };


  const cancelar = () => {
    setMostrarModal(false);
  };

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mesas`)
      .then(response => {
        const data = response.data.data;
        console.log('Respuesta de la API:', response.data);
        setMesas(data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);


  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return 'bg-red-500';

      case 'en_preparacion':
        return 'bg-orange-500';
      case 'listo_para_servir':
        return 'bg-yellow-500';
      case 'servido':
        return 'bg-blue-500';
      case 'pagado':
        return 'bg-purple-500';
      case 'cerrado':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  useEffect(() => {
    const newBgImage = window.innerWidth >= 1024 ? "/imagenPC.jpg" : "/imagenMobile.jpg";
    setBgImage(newBgImage);
  }, []);

  return (
    <ProtectedPage checkAuth={checkAuth}>
      <div className="page-container" style={{ backgroundImage: `url(${bgImage})` }}>
        {/* Grid de mesas */}
        <div className="mesa-grid">
          {mesas
            ?.sort((a, b) => a.numero_mesa - b.numero_mesa)
            .map((mesa: Mesa) => (
              <Link key={mesa.id} href="#">
                <button
                  className={`mesa-btn ${getEstadoColor(mesa.estado)}`}
                  onClick={async (e) => {
                    e.preventDefault();
                    setMesaSeleccionada(mesa);

                    if (mesa.estado === 'cerrado') {
                      setMostrarModal(true);
                    } else {
                      try {
                        const { data } = await axios.get(
                          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mesas/${mesa.documentId}?populate=pedidos`
                        );
                        const mesaActualizada = data.data;

                        if (!mesaActualizada?.pedidos) return;

                        const pedidoActivo = mesaActualizada.pedidos.find(
                          (pedido: { estado: string }) => pedido.estado === 'abierto'
                        );

                        if (pedidoActivo) {
                          window.location.href = `/reservas/${mesa.numero_mesa}?pedidoId=${pedidoActivo.documentId}`;
                        }
                      } catch (error) {
                        console.error('Error al consultar pedidos de la mesa:', error);
                      }
                    }
                  }}
                >
                  {cargando ? (
                    <div className="loader-wrapper">
                      <LoaderCircle className="animate-spin" />
                      <span className="loader-text">Cargando...</span>
                    </div>
                  ) : (
                    `Mesa ${mesa.numero_mesa}`
                  )}
                </button>
              </Link>
            ))}
        </div>

        {/* Modal para abrir mesa */}
        {mostrarModal && (
          <div
            className="modal-bg"
            style={{ backgroundImage: `url(${bgImage})` }}
          >
            <div className="modal-wrapper">
              <div className="modal-box">
                <h2 className="modal-title">Abrir Mesa</h2>
                <p className="modal-text">
                  ¿Estás seguro de que deseas abrir la mesa {mesaSeleccionada?.numero_mesa}?
                </p>
                <div className="modal-actions">
                  <button
                    className="mesa-btn"
                    onClick={abrirMesa}
                    disabled={cargando}
                  >
                    {cargando ? (
                      <>
                        <LoaderCircle className="animate-spin justify-center" /> Cargando...
                      </>
                    ) : (
                      "Abrir Mesa"
                    )}
                  </button>
                  {!cargando && (
                    <button
                      className="mesa-btn"
                      onClick={cancelar}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </ProtectedPage>
  );


};

export default Mesas;
