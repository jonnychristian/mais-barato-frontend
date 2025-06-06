
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product, ProductPrice } from "@/types/product";
import { getTop3LowestPrices } from "@/data/mockData";
import { processProductData } from "@/services/api";

interface ProductCardProps {
  product: Product;
  onNavigate?: () => void; // Função para ser executada antes da navegação
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const navigate = useNavigate();
  const top3Prices = getTop3LowestPrices(product);

  const handleClick = () => {
    // Executa a função onNavigate se fornecida (salvar estado)
    if (onNavigate) {
      onNavigate();
    }
    
    // Processa o produto para garantir consistência de dados
    const processedProduct = processProductData(product);
    // Passa o produto processado como state na navegação
    navigate(`/product/${product.id}`, { state: { product: processedProduct } });
  };

  return (
    <Card 
      className="flex flex-col overflow-hidden transition-all hover:shadow-lg cursor-pointer" 
      onClick={handleClick}
    >
        <div className="w-full aspect-[4/3] overflow-hidden">
          <img
            src={product.image || "https://placehold.co/300x300?text=Produto"}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain transition-transform"
          />
        </div>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl line-clamp-2">{product.name}</CardTitle>
          <Badge variant="outline" className="ml-2 text-xs">
            {product.category}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h3 className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">Melhores preços:</h3>
        <div className="space-y-3">
          {top3Prices.map((price) => (
            <div
              key={price.supermarketId}
              className={`flex items-center justify-between rounded-md p-2 ${
                price.isLowestPrice
                  ? "bg-green-50 dark:bg-green-950/30"
                  : "bg-gray-50 dark:bg-gray-800/30"
              }`}
            >
              <div className="flex items-center">
                <span className="text-sm font-medium">{price.supermarketName}</span>
              </div>
              <div className="flex items-center">
                <span
                  className={`text-base font-bold ${
                    price.isLowestPrice ? "text-green-600 dark:text-green-400" : ""
                  }`}
                >
                  R$ {price.price.toFixed(2)}
                </span>
                {price.isLowestPrice && (
                  <Badge variant="success" className="ml-2 bg-green-500 text-xs">
                    Menor preço
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
