import DetalleProducto from "./DetalleProducto";

interface DetallePedido {
  id: string;
  id_pedido: string;
  hora_apertura: Date;
  hora_cierre: Date | null;
  detalle_productos: DetalleProducto[];
  Detalle_de_pago: string;
  estado: 'abierto' | 'en_preparacion' | 'listo_para_servir' | 'servido' | 'pagado' | 'cerrado';
  mesa: number;
  contador: number;
  documentId: string;
  id_productos: Array<{
    id: string;
    documentId: string;
    nombre: string;
    precio: string;
    cantidad: number;
    tipo: string | null;
  }>;
}

export default DetallePedido;