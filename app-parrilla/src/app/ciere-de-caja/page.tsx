"use client";
import Pedido from "@/types/pedidos";
import { useState } from "react";

export default function FiltrarPedidos() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [totales, setTotales] = useState<{ [key: string]: number }>({});
  const [sumaTotal, setSumaTotal] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [seccionesVisibles, setSeccionesVisibles] = useState<{ [key: string]: boolean }>({
    Efectivo: true,
    QR: true,
    Transferencia: true,
    Tarjeta: true,
  });

  const fetchPedidos = async () => {
    if (!fechaInicio || !fechaFin || !horaInicio || !horaFin) {
      alert("Por favor, completa todas las fechas y horas.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      // ✅ Concatenar fecha y hora
      const fechaInicioLocal = new Date(`${fechaInicio}T${horaInicio}:00`);
      const fechaFinLocal = new Date(`${fechaFin}T${horaFin}:00`);

      /* console.log("🕓 Fecha inicio (local):", fechaInicioLocal.toString());
      console.log("🕓 Fecha fin (local):", fechaFinLocal.toString());
      console.log("📤 Enviando en ISO:", {
        desde: fechaInicioLocal.toISOString(),
        hasta: fechaFinLocal.toISOString(),
      }); */

      const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/pedidos?filters[fecha][$gte]=${fechaInicioLocal.toISOString()}&filters[fecha][$lte]=${fechaFinLocal.toISOString()}&populate[detalles_de_pedido][populate][detalle_productos]=true`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data || !data.data || !Array.isArray(data.data)) {
        setPedidos([]);
        setTotales({});
        setSumaTotal(0);
        setCargando(false);
        setError("No se encontraron pedidos en el rango seleccionado.");
        return;
      }

      const pedidosConProductos = data.data.map((pedido: Pedido) => {
        const totalPedido = pedido.detalles_de_pedido?.detalle_productos?.reduce(
          (acc, producto) => acc + producto.subtotal,
          0
        ) || 0;

        // 🪵 Mostrar cómo interpreta el navegador la hora de cada pedido
        /* console.log("📥 Pedido recibido:", {
          id: pedido.documentId,
          fecha_original: pedido.fecha,
          fecha_parseada: new Date(pedido.fecha).toString(),
          fecha_local: new Date(pedido.fecha).toLocaleString(),
        });
 */
        return {
          ...pedido,
          totalPedido,
          metodoPago: pedido.detalles_de_pedido?.Detalle_de_pago || "Desconocido",
        };
      });

      const nuevosTotales: { [key: string]: number } = {};
      pedidosConProductos.forEach((pedido: Pedido) => {
        const metodo = pedido.detalles_de_pedido?.Detalle_de_pago || "Desconocido";
        nuevosTotales[metodo] = (nuevosTotales[metodo] || 0) + pedido.total;
      });

      setPedidos(pedidosConProductos);
      setTotales(nuevosTotales);
      setSumaTotal(pedidosConProductos.reduce((acc: number, p: Pedido) => acc + p.total, 0));
    } catch (error) {
      console.error("❌ Error al obtener pedidos:", error);
      setError("Hubo un problema al obtener los pedidos.");
    } finally {
      setCargando(false);
    }
  };



  // 🔽 Función para alternar la visibilidad de cada sección
  const toggleSeccion = (metodo: string) => {
    setSeccionesVisibles((prev) => ({
      ...prev,
      [metodo]: !prev[metodo],
    }));
  };

  return (
    <div className="page-container">
    <h2 className="titulo-seccion">📜 Filtrar Pedidos por Fecha y Hora</h2>
  
    <div className="filtro-grid">
      <div>
        <label className="etiqueta">Desde (Fecha)</label>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="input"
          placeholder="Desde (Fecha)"
        />
      </div>
  
      <div>
        <label className="etiqueta">Desde (Hora)</label>
        <input
          type="time"
          value={horaInicio}
          onChange={(e) => setHoraInicio(e.target.value)}
          className="input"
          placeholder="Desde (Hora)"
        />
      </div>
  
      <div>
        <label className="etiqueta">Hasta (Fecha)</label>
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="input"
          placeholder="Hasta (Fecha)"
        />
      </div>
  
      <div>
        <label className="etiqueta">Hasta (Hora)</label>
        <input
          type="time"
          value={horaFin}
          onChange={(e) => setHoraFin(e.target.value)}
          className="input"
          placeholder="Hasta (Hora)"
        />
      </div>
  
      <button onClick={fetchPedidos} className="btn-buscar">
        🔍 Buscar
      </button>
    </div>
  
    {cargando && <p className="mensaje-cargando">⏳ Buscando pedidos...</p>}
    {error && <p className="mensaje-error">{error}</p>}
  
    {!cargando && pedidos.length === 0 && (
      <p className="mensaje-vacio">
        ⚠️ No se encontraron pedidos en el rango seleccionado.
      </p>
    )}
  
    {pedidos.length > 0 && (
      <h3 className="total-general">
        💰 Total General: <span>${sumaTotal}</span>
      </h3>
    )}
  
    {["Efectivo", "QR", "Transferencia", "Tarjeta"].map((metodo) => (
      <div key={metodo} className="seccion-metodo">
        <div className="seccion-header" onClick={() => toggleSeccion(metodo)}>
          <h4 className="seccion-titulo">💳 {metodo}</h4>
          <span className="seccion-toggle">
            {seccionesVisibles[metodo] ? "▲" : "▼"}
          </span>
        </div>
  
        <p className="seccion-total">
          Total: <span>${totales[metodo] || 0}</span>
        </p>
  
        {seccionesVisibles[metodo] && (
          <div className="seccion-listado">
            <ul>
              {pedidos
                .filter(
                  (pedido) =>
                    pedido.detalles_de_pedido.Detalle_de_pago === metodo
                )
                .map((pedido) => (
                  <li key={pedido.id} className="pedido-item">
                    <p><strong>ID:</strong> {pedido.documentId}</p>
                    <p><strong>📅 Fecha:</strong> {new Date(pedido.fecha).toLocaleDateString()}</p>
                    <p><strong>⏰ Hora Apertura:</strong> {new Date(pedido.fecha).toLocaleTimeString()}</p>
                    <p><strong>💵 Total Pedido:</strong> ${pedido.total}</p>
                    <ul className="pedido-detalles">
                      {pedido.detalles_de_pedido.detalle_productos.map((prod) => (
                        <li key={prod.documentId} className="detalle-producto">
                          {prod.cantidad}x - ${prod.subtotal}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    ))}
  </div>
  );


}