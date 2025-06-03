
import { Product, Supermarket } from "../types/product";

export const supermarkets: Supermarket[] = [
  { id: "1", name: "Supermercado Extra", logo: "https://placehold.co/200x100?text=Extra" },
  { id: "2", name: "Carrefour", logo: "https://placehold.co/200x100?text=Carrefour" },
  { id: "3", name: "Pão de Açúcar", logo: "https://placehold.co/200x100?text=PãoDeAçúcar" },
  { id: "4", name: "Assaí", logo: "https://placehold.co/200x100?text=Assaí" },
  { id: "5", name: "Dia", logo: "https://placehold.co/200x100?text=Dia" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Arroz Branco 5kg",
    image: "https://placehold.co/300x300?text=Arroz",
    description: "Arroz branco tipo 1, pacote de 5kg",
    category: "Alimentos",
    prices: [
      { supermarketId: "1", supermarketName: "Supermercado Extra", price: 19.9 },
      { supermarketId: "2", supermarketName: "Carrefour", price: 22.5 },
      { supermarketId: "3", supermarketName: "Pão de Açúcar", price: 23.9 },
      { supermarketId: "4", supermarketName: "Assaí", price: 18.5, isLowestPrice: true },
      { supermarketId: "5", supermarketName: "Dia", price: 20.9 },
    ],
  },
  {
    id: "2",
    name: "Feijão Carioca 1kg",
    image: "https://placehold.co/300x300?text=Feijão",
    description: "Feijão carioca tipo 1, pacote de 1kg",
    category: "Alimentos",
    prices: [
      { supermarketId: "1", supermarketName: "Supermercado Extra", price: 7.9 },
      { supermarketId: "2", supermarketName: "Carrefour", price: 6.5, isLowestPrice: true },
      { supermarketId: "3", supermarketName: "Pão de Açúcar", price: 8.9 },
      { supermarketId: "4", supermarketName: "Assaí", price: 6.8 },
      { supermarketId: "5", supermarketName: "Dia", price: 7.2 },
    ],
  },
  {
    id: "3",
    name: "Leite Integral 1L",
    image: "https://placehold.co/300x300?text=Leite",
    description: "Leite integral UHT, embalagem tetra pak de 1 litro",
    category: "Laticínios",
    prices: [
      { supermarketId: "1", supermarketName: "Supermercado Extra", price: 4.99 },
      { supermarketId: "2", supermarketName: "Carrefour", price: 4.79 },
      { supermarketId: "3", supermarketName: "Pão de Açúcar", price: 5.29 },
      { supermarketId: "4", supermarketName: "Assaí", price: 4.59, isLowestPrice: true },
      { supermarketId: "5", supermarketName: "Dia", price: 4.89 },
    ],
  },
  {
    id: "4",
    name: "Óleo de Soja 900ml",
    image: "https://placehold.co/300x300?text=Óleo",
    description: "Óleo de soja refinado, garrafa de 900ml",
    category: "Alimentos",
    prices: [
      { supermarketId: "1", supermarketName: "Supermercado Extra", price: 8.5 },
      { supermarketId: "2", supermarketName: "Carrefour", price: 7.99, isLowestPrice: true },
      { supermarketId: "3", supermarketName: "Pão de Açúcar", price: 9.2 },
      { supermarketId: "4", supermarketName: "Assaí", price: 8.1 },
      { supermarketId: "5", supermarketName: "Dia", price: 8.3 },
    ],
  },
  {
    id: "5",
    name: "Café em Pó 500g",
    image: "https://placehold.co/300x300?text=Café",
    description: "Café torrado e moído, embalagem a vácuo, 500g",
    category: "Bebidas",
    prices: [
      { supermarketId: "1", supermarketName: "Supermercado Extra", price: 15.9 },
      { supermarketId: "2", supermarketName: "Carrefour", price: 16.5 },
      { supermarketId: "3", supermarketName: "Pão de Açúcar", price: 17.9 },
      { supermarketId: "4", supermarketName: "Assaí", price: 14.9, isLowestPrice: true },
      { supermarketId: "5", supermarketName: "Dia", price: 15.5 },
    ],
  },
  {
    id: "6",
    name: "Açúcar Refinado 1kg",
    image: "https://placehold.co/300x300?text=Açúcar",
    description: "Açúcar refinado, pacote de 1kg",
    category: "Alimentos",
    prices: [
      { supermarketId: "1", supermarketName: "Supermercado Extra", price: 4.99 },
      { supermarketId: "2", supermarketName: "Carrefour", price: 4.49, isLowestPrice: true },
      { supermarketId: "3", supermarketName: "Pão de Açúcar", price: 5.29 },
      { supermarketId: "4", supermarketName: "Assaí", price: 4.59 },
      { supermarketId: "5", supermarketName: "Dia", price: 4.79 },
    ],
  },
];

// Função auxiliar para pegar os 3 menores preços de um produto
export const getTop3LowestPrices = (product: Product) => {
  return [...product.prices]
    .sort((a, b) => a.price - b.price)
    .slice(0, 3)
    .map((price, index) => ({
      ...price,
      isLowestPrice: index === 0
    }));
};
