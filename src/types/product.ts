export interface ProductType {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  userId: string;
  imageUrl: string | null;
}
