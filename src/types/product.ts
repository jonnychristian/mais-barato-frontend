
export interface Supermarket {
  id: string;
  name: string;
  logo?: string;
}

export interface ProductPrice {
  supermarketId: string;
  supermarketName: string;
  price: number;
  isLowestPrice?: boolean;
}

export interface Product {
  id: string;
  name: string;
  image?: string;
  description?: string;
  category: string;
  prices: ProductPrice[];
}
