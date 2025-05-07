"use client";
import Mesa from "@/types/mesa";
import Pedido from "@/types/pedidos";
import Producto from "@/types/productos";
import { useState, useEffect } from "react";
import ProtectedPage from "../components/ProtectedPage";

const Dashboard = () => {
  const [bgImage, setBgImage] = useState("/imagenMobile.jpg");
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [productosVisibles, setProductosVisibles] = useState<{ [key: number]: Producto[] }>({});
  const [botonVisibilidad, setBotonVisibilidad] = useState<{ [key: number]: boolean }>({});
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const newBgImage = window.innerWidth >= 1024 ? "/imagenPC.jpg" : "/imagenMobile.jpg";
      setBgImage(newBgImage);
    }
  }, []);

  useEffect(() => {
    const fetchMesasAbiertas = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
        const response = await fetch(
          `${API_URL}/api/mesas?filters[estado][$eq]=abierto&populate[0]=pedidos&populate[1]=pedidos.detalles_de_pedido`
        );

        if (!response.ok) {
          throw new Error(`Error en la API: ${response.statusText}`);
        }

        const data = await response.json();
        const mesasAbiertas = data.data || [];

        // Procesar mesas para obtener su `hora_apertura` más antigua
        const mesasProcesadas = mesasAbiertas.map((mesa: { pedidos: never[]; }) => {
          const pedidos: Pedido[] = mesa.pedidos || []; // Tipar como un array de objetos Pedido

          // Ordenar los pedidos por fecha de creación (descendente)
          pedidos.sort((a, b) => {
            const fechaA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const fechaB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            return fechaB - fechaA;
          });

          // Tomar el pedido más reciente
          const pedidoMasReciente = pedidos[0];

          // Obtener la `hora_apertura` del `detalles_de_pedido`
          const detallesPedido = pedidoMasReciente?.detalles_de_pedido || null;
          const horaApertura = detallesPedido?.hora_apertura || null;

          return {
            ...mesa,
            horaApertura,
            detallesPedidoId: detallesPedido?.documentId || null,
          };
        });

        // Ordenar mesas por `horaApertura` ascendente (la que lleva más tiempo abierta primero)
        mesasProcesadas.sort((a: { horaApertura: string | number | Date; }, b: { horaApertura: string | number | Date; }) => {
          const horaAperturaA = a.horaApertura ? new Date(a.horaApertura).getTime() : 0;
          const horaAperturaB = b.horaApertura ? new Date(b.horaApertura).getTime() : 0;

          return horaAperturaA - horaAperturaB;
        });

        setMesas(mesasProcesadas);
      } catch (error) {
        console.error("Error obteniendo las mesas abiertas:", error);
      }
    };

    fetchMesasAbiertas();
  }, []);



  const toggleProductos = async (mesaId: number, detallesPedidoId: number | string) => {
    if (!detallesPedidoId) return;

    // Alternar la visibilidad de los productos para la mesa
    setBotonVisibilidad(prev => ({
      ...prev,
      [mesaId]: !prev[mesaId], // Cambiar la visibilidad para esta mesa
    }));

    if (!botonVisibilidad[mesaId]) {
      // Si los productos no están visibles, cargamos los productos
      const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
      const response = await fetch(
        `${API_URL}/api/detalle-productos?filters[detalles_de_pedido][id][$eq]=${detallesPedidoId}&populate=producto`
      );

      if (!response.ok) {
        throw new Error(`Error obteniendo productos: ${response.statusText}`);
      }

      const data = await response.json();
      const productos = data.data || [];

      setProductosVisibles(prev => ({
        ...prev,
        [mesaId]: productos,
      }));
    } else {
      // Si los productos están visibles, los ocultamos
      setProductosVisibles(prev => ({
        ...prev,
        [mesaId]: [],
      }));
    }
  };
  

  return (
    <ProtectedPage checkAuth={checkAuth}>
    <div
        className="page-background"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
        }}
      >
        <div className="mesa-wrapper">
          {mesas.length > 0 ? (
            mesas.map(mesa => (
              <div key={mesa.id} className="mesa-card">
                <h2 className="mesa-title">Mesa {mesa.numero_mesa}</h2>
                <p className="mesa-estado">Estado: {mesa.estado}</p>
                <p className="mesa-id">ID: {mesa.documentId}</p>
                {mesa.pedidos?.[0]?.detalles_de_pedido && (
                  <p className="mesa-hora">
                    Hora de apertura del pedido: {new Date(mesa.pedidos[0].detalles_de_pedido.hora_apertura).toLocaleTimeString()}
                  </p>
                )}

                {mesa.pedidos?.[0]?.detalles_de_pedido && (
                  <button
                    className="mesa-toggle-btn"
                    onClick={() => toggleProductos(mesa.id, mesa.pedidos[0].detalles_de_pedido.id)}
                  >
                    {botonVisibilidad[mesa.id] ? "Ocultar productos" : "Ver productos"}
                  </button>
                )}

                {botonVisibilidad[mesa.id] && productosVisibles[mesa.id]?.length > 0 && (
                  <div className="mesa-productos">
                    <h3 className="mesa-productos-title">Productos:</h3>
                    <ul className="mesa-productos-list">
                      {productosVisibles[mesa.id].map((producto) => (
                        <li key={producto.id} className="mesa-producto-item">
                          <p className="producto-nombre">{producto.producto.nombre}</p>
                          <p className="producto-detalle">Cantidad: {producto.cantidad}</p>
                          <p className="producto-detalle">Subtotal: ${producto.subtotal}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="sin-mesas">No hay mesas abiertas en este momento.</p>
          )}
        </div>
      </div>
    </ProtectedPage>   
  );
};

export default Dashboard;
