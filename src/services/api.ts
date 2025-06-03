
import { Product } from "@/types/product";

// Altere esta URL para o endereço da sua API
const API_BASE = "https://banana-circle-poetry-respondent.trycloudflare.com"; // Base URL extraída para reutilização

export const fetchProducts = async (cursor = 0, limit = 10, searchTerm = ""): Promise<Product[]> => {
  try {
    // Usando o endpoint correto para buscar produtos
    const endpoint = searchTerm 
      ? `${API_BASE}/produto/buscar-produtos?nome=${encodeURIComponent(searchTerm)}`
      : `${API_BASE}/produto/buscarProdutos?cursor=${cursor}&limit=${limit}`;
    
    console.log(`Fazendo requisição para: ${endpoint}`);
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar produtos: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  }
};

export const fetchProductById = async (id: string): Promise<Product> => {
  try {
    console.log(`Buscando produto com ID: ${id}`);
    const response = await fetch(`${API_BASE}/produto/${id}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar produto: ${response.status}`);
    }
    
    const rawData = await response.json();
    console.log("Resposta original da API:", rawData);
    
    // Processando dados do produto
    return processProductData(rawData);
  } catch (error) {
    console.error(`Erro ao buscar produto ${id}:`, error);
    throw error;
  }
};

// Função para processar e normalizar os dados de produto
export const processProductData = (rawData: any): Product => {
  // Criando uma cópia do objeto para manipulação
  let data = { ...rawData };
  
  // Verificando a estrutura dos preços
  if (!data.prices) {
    console.log("Aviso: Propriedade prices não existe na resposta. Criando array vazio.");
    data.prices = [];
  } else if (!Array.isArray(data.prices)) {
    console.log("Aviso: Propriedade prices não é um array. Verificando o formato:", data.prices);
    
    // Se prices for um objeto, tenta converter para array
    if (typeof data.prices === 'object') {
      try {
        // Tenta converter o objeto em um array de preços
        const pricesArray = Object.entries(data.prices).map(([supermarketId, price]) => {
          // Assumindo que cada entrada seja um objeto com price e supermarketName
          if (typeof price === 'object' && price !== null) {
            return {
              supermarketId,
              supermarketName: (price as any).supermarketName || 'Supermercado',
              price: typeof (price as any).price === 'number' ? (price as any).price : 
                    typeof price === 'number' ? price : 0
            };
          } else if (typeof price === 'number') {
            // Se for apenas um número, assume que é o preço
            return {
              supermarketId,
              supermarketName: 'Supermercado ' + supermarketId,
              price
            };
          }
          return null;
        }).filter(Boolean);
        
        if (pricesArray.length > 0) {
          console.log("Convertido objeto prices para array:", pricesArray);
          data.prices = pricesArray;
        } else {
          console.log("Não foi possível converter o objeto prices. Definindo como array vazio.");
          data.prices = [];
        }
      } catch (e) {
        console.error("Erro ao converter prices:", e);
        data.prices = [];
      }
    } else {
      console.log("Definindo prices como array vazio devido ao formato não reconhecido.");
      data.prices = [];
    }
  }
  
  console.log("Produto processado para exibição:", data);
  return data;
};
