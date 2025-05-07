import DetallePedido from "./detalle_de_pedido";

interface Pedido {
    id: number;
    documentId: string;
    fecha: string;
    total: number;
    estado: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    detalles_de_pedido: DetallePedido;
    mesa: number | null;
  }
  
  export default Pedido;