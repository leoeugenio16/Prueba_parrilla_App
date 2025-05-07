import DetalleProducto from '@/types/DetalleProducto';
interface Producto {
  subtotal: number;
  producto: Producto;
  id: number;
  documentId: string;
  nombre: string;
  Descripcion: string;
  precio: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  cantidad: number;
  tipo: null | string; // permite null o string
  DetalleProducto: DetalleProducto;
}

export default Producto;