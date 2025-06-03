
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProductById } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Product } from "@/types/product";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Verifica se temos o produto no state da navegação
  const productFromState = location.state?.product as Product | undefined;
  
  console.log("Produto recebido via state:", productFromState);

  // Se temos o produto no state, usamos ele diretamente
  // Caso contrário, buscamos da API
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => id ? fetchProductById(id) : Promise.reject("ID não fornecido"),
    enabled: !!id && !productFromState, // Só faz a requisição se não tivermos o produto no state
    initialData: productFromState, // Usa o produto do state como dado inicial
    meta: {
      onError: (error) => {
        console.error("Erro ao carregar produto:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do produto.",
          variant: "destructive",
        });
      }
    }
  });

  const handleBackClick = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="outline" 
            className="mb-6 opacity-50"
            disabled
          >
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-16" />
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <div className="space-y-3 mt-6">
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Button onClick={() => navigate("/")}>Voltar para a página inicial</Button>
        </div>
      </div>
    );
  }

  // Garantir que prices seja um array válido
  const prices = Array.isArray(product.prices) ? product.prices : [];
  
  // Ordena os preços do menor para o maior (apenas se houver preços)
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedPrices.length > 0 ? sortedPrices[0] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          className="mb-6 flex items-center gap-2" 
          onClick={handleBackClick}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para resultados
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-lg overflow-hidden">
            <img
              src={product.image || "https://placehold.co/600x600?text=Produto"}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <Badge variant="outline" className="text-sm">
                {product.category}
              </Badge>
            </div>

            {product.description && (
              <p className="text-muted-foreground mb-6">{product.description}</p>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Melhor preço:</h2>
              
              {lowestPrice ? (
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">{lowestPrice.supermarketName}</span>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        R$ {lowestPrice.price.toFixed(2)}
                      </span>
                      <Badge variant="success" className="ml-2 bg-green-500">
                        Menor preço
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Nenhum preço disponível</AlertTitle>
                  <AlertDescription>
                    Este produto ainda não tem informações de preço cadastradas.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {sortedPrices.length > 0 ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Todos os preços:</h2>
                <div className="space-y-3">
                  {sortedPrices.map((price, index) => (
                    <div
                      key={`price-${index}`}
                      className={`flex items-center justify-between rounded-md p-3 ${
                        price === lowestPrice
                          ? "bg-green-50 dark:bg-green-950/30"
                          : "bg-gray-50 dark:bg-gray-800/30"
                      }`}
                    >
                      <span className="font-medium">{price.supermarketName}</span>
                      <span
                        className={`text-lg font-bold ${
                          price === lowestPrice ? "text-green-600 dark:text-green-400" : ""
                        }`}
                      >
                        R$ {price.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
