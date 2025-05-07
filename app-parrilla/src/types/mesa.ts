import Pedido from "./pedidos";

interface Mesa {
  id: number;
  documentId: string;
  numero_mesa: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  estado: string;
  pedidos: Pedido[];
}
  export default Mesa;