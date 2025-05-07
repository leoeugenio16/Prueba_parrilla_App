import DetallePedido from "./detalle_de_pedido";
import Producto from "./productos";

interface DetalleProducto {
    documentId: string;
    producto: Producto;          // Relación con el producto
    detalles_de_pedido: DetallePedido; // Relación con detalles_de_pedido
    cantidad: number;            // Cantidad del producto en este detalle
    subtotal: number;            // Subtotal calculado para este producto en el detalle
}
export default DetalleProducto;