import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { Search, ArrowUp } from "lucide-react";
import { fetchProducts } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const normalizeText = (text: string): string => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const STORAGE_KEYS = {
  PRODUCTS: "economia-market-products",
  CURSOR: "economia-market-cursor",
  SCROLL_POSITION: "economia-market-scroll-position",
  SEARCH_TERM: "economia-market-search-term"
};

const Index = () => {
  const getSavedState = () => {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const savedCursor = localStorage.getItem(STORAGE_KEYS.CURSOR);
      const savedScrollPosition = localStorage.getItem(STORAGE_KEYS.SCROLL_POSITION);
      const savedSearchTerm = localStorage.getItem(STORAGE_KEYS.SEARCH_TERM);
      
      return {
        products: savedProducts ? JSON.parse(savedProducts) : [],
        cursor: savedCursor ? parseInt(savedCursor, 10) : 0,
        scrollPosition: savedScrollPosition ? parseInt(savedScrollPosition, 10) : 0,
        searchTerm: savedSearchTerm || ""
      };
    } catch (error) {
      console.error("Erro ao recuperar estado salvo:", error);
      return { products: [], cursor: 0, scrollPosition: 0, searchTerm: "" };
    }
  };

  const savedState = getSavedState();
  
  const [searchTerm, setSearchTerm] = useState(savedState.searchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(savedState.searchTerm);
  const [products, setProducts] = useState<Product[]>(savedState.products);
  const [cursor, setCursor] = useState(savedState.cursor);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const limit = 10;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const executeSearch = useCallback(() => {
    setDebouncedSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  useEffect(() => {
    setProducts([]);
    setCursor(0);
    setHasMore(true);
  }, [debouncedSearchTerm]);

  const saveCurrentState = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.CURSOR, cursor.toString());
      localStorage.setItem(STORAGE_KEYS.SEARCH_TERM, searchTerm);
      
      if (mainContainerRef.current) {
        const scrollPosition = window.scrollY;
        localStorage.setItem(STORAGE_KEYS.SCROLL_POSITION, scrollPosition.toString());
      }
    } catch (error) {
      console.error("Erro ao salvar estado:", error);
    }
  }, [products, cursor, searchTerm]);

  useEffect(() => {
    window.addEventListener("beforeunload", saveCurrentState);
    
    return () => {
      window.removeEventListener("beforeunload", saveCurrentState);
      saveCurrentState(); // Salva também quando o componente é desmontado
    };
  }, [saveCurrentState]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const { data: initialProducts, isLoading, error } = useQuery({
    queryKey: ["products", 0, limit, debouncedSearchTerm],
    queryFn: () => fetchProducts(0, limit, debouncedSearchTerm),
    enabled: products.length === 0 || debouncedSearchTerm !== savedState.searchTerm,
    meta: {
      onError: () => {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os produtos. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    }
  });

  useEffect(() => {
    if (initialProducts && products.length === 0) {
      setProducts(initialProducts);
      if (initialProducts.length > 0) {
        setCursor(parseInt(initialProducts[initialProducts.length - 1].id, 10));
      }
      setHasMore(initialProducts.length >= limit);
    }
  }, [initialProducts, products.length]);

  useEffect(() => {
    const savedScrollPosition = parseInt(localStorage.getItem(STORAGE_KEYS.SCROLL_POSITION) || "0", 10);
    
    if (savedScrollPosition > 0 && !isLoading) {
      const timeoutId = setTimeout(() => {
        window.scrollTo(0, savedScrollPosition);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);

  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextProducts = await fetchProducts(cursor, limit, debouncedSearchTerm);
      
      if (nextProducts.length > 0) {
        setProducts(prev => [...prev, ...nextProducts]);
        setCursor(parseInt(nextProducts[nextProducts.length - 1].id, 10));
        setHasMore(nextProducts.length >= limit);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Erro ao carregar mais produtos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar mais produtos. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, hasMore, isLoadingMore, debouncedSearchTerm]);

  useEffect(() => {
    if (isLoading || !hasMore) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, hasMore, loadMoreProducts, isLoadingMore]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEARCH_TERM, searchTerm);
  }, [searchTerm]);

  const clearSavedState = () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    setProducts([]);
    setCursor(0);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    window.location.reload();
  };

  const ProductSkeletons = () => (
    <>
      {[...Array(4)].map((_, index) => (
        <div key={index} className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" ref={mainContainerRef}>
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-4 px-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-2xl font-bold hover:opacity-80 transition-opacity flex-shrink-0"
            >
              EconomiaMarket
            </Link>
            <div className="flex-grow">
              <div className="relative mx-auto max-w-2xl">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar produtos..."
                      className="pl-10 h-12"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyDown}
                      ref={searchInputRef}
                    />
                  </div>
                  <Button 
                    onClick={executeSearch}
                    className="h-12 px-4"
                    aria-label="Buscar"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            {products.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearSavedState}
                className="text-xs flex-shrink-0"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <p className="mb-6 text-center text-muted-foreground">
            Compare preços e economize nas suas compras de supermercado
          </p>
        </header>

        <main>
          <h2 className="mb-6 text-2xl font-semibold">
            {debouncedSearchTerm
              ? `Resultados para "${debouncedSearchTerm}"`
              : "Produtos populares"}
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              <ProductSkeletons />
            ) : error ? (
              <div className="col-span-full py-12 text-center">
                <p className="text-xl font-medium text-destructive">
                  Erro ao carregar produtos
                </p>
                <p className="text-muted-foreground">
                  Tente novamente mais tarde
                </p>
              </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onNavigate={saveCurrentState}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-xl font-medium">
                  Nenhum produto encontrado para "{debouncedSearchTerm}"
                </p>
                <p className="text-muted-foreground">
                  Tente buscar com termos diferentes
                </p>
              </div>
            )}
          </div>

          {!isLoading && products.length > 0 && hasMore && (
            <div 
              ref={loadMoreRef} 
              className="w-full py-8 flex justify-center"
            >
              {isLoadingMore ? (
                <div className="space-y-4 w-full max-w-md">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <Button 
                  onClick={loadMoreProducts} 
                  variant="outline"
                >
                  Carregar mais produtos
                </Button>
              )}
            </div>
          )}

          {!isLoading && !isLoadingMore && products.length > 0 && !hasMore && (
            <div className="w-full py-8 text-center text-muted-foreground">
              Você chegou ao fim da lista de produtos.
            </div>
          )}
        </main>
      </div>
      
      {showBackToTop && (
        <Button
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-20"
          onClick={scrollToTop}
          size="icon"
          variant="default"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default Index;
