import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProductApi,
  createProductCategoryApi,
  getProductCategoriesApi,
  getProductsApi,
  getStocksApi,
  registerStockAdjustmentApi,
  registerStockEntryApi,
  toggleProductStatusApi,
  updateProductApi,
} from "../api/inventory.api";

const asList = (response) => {
  if (Array.isArray(response)) return response;
  return response?.data ?? [];
};

const getProductStock = (product, stockByProduct) => {
  const stock = stockByProduct.get(product.id);
  return Number(stock?.quantity ?? product.stock?.[0]?.quantity ?? 0);
};

export function useInventory() {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["inventory-products"],
    queryFn: getProductsApi,
  });

  const categoriesQuery = useQuery({
    queryKey: ["product-categories"],
    queryFn: getProductCategoriesApi,
  });

  const stocksQuery = useQuery({
    queryKey: ["inventory-stocks"],
    queryFn: getStocksApi,
  });

  const products = asList(productsQuery.data);
  const categories = asList(categoriesQuery.data);
  const stocks = asList(stocksQuery.data);

  const inventoryItems = useMemo(() => {
    const stockByProduct = new Map(
      stocks.map((stock) => [stock.productId ?? stock.product?.id, stock]),
    );

    return products.map((product) => {
      const stock = stockByProduct.get(product.id);
      const currentStock = getProductStock(product, stockByProduct);
      const minStock = Number(product.minStock ?? 0);
      const category = product.category ?? stock?.product?.category;

      return {
        ...product,
        category,
        currentStock,
        lowStock: currentStock <= minStock,
        stockRecord: stock,
      };
    });
  }, [products, stocks]);

  const refreshInventory = () => {
    queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
    queryClient.invalidateQueries({ queryKey: ["inventory-stocks"] });
    queryClient.invalidateQueries({ queryKey: ["reception-products"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const createProductMutation = useMutation({
    mutationFn: createProductApi,
    onSuccess: () => {
      refreshInventory();
      toast.success("Producto creado correctamente");
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Error al crear producto");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateProductApi(id, data),
    onSuccess: () => {
      refreshInventory();
      toast.success("Producto actualizado correctamente");
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Error al actualizar producto");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }) => toggleProductStatusApi(id, active),
    onSuccess: (_, { active }) => {
      refreshInventory();
      toast.success(active ? "Producto activado" : "Producto desactivado");
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Error al cambiar estado");
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: createProductCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast.success("Categoría creada correctamente");
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Error al crear categoría");
    },
  });

  const entryMutation = useMutation({
    mutationFn: registerStockEntryApi,
    onSuccess: () => {
      refreshInventory();
      toast.success("Entrada de stock registrada");
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Error al registrar entrada");
    },
  });

  const adjustmentMutation = useMutation({
    mutationFn: registerStockAdjustmentApi,
    onSuccess: () => {
      refreshInventory();
      toast.success("Ajuste de stock registrado");
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Error al ajustar stock");
    },
  });

  return {
    products: inventoryItems,
    categories,
    stocks,
    isLoading:
      productsQuery.isLoading ||
      categoriesQuery.isLoading ||
      stocksQuery.isLoading,
    isRefreshing:
      productsQuery.isFetching ||
      categoriesQuery.isFetching ||
      stocksQuery.isFetching,
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    toggleProductStatus: toggleStatusMutation.mutate,
    createCategory: createCategoryMutation.mutateAsync,
    registerStockEntry: entryMutation.mutateAsync,
    registerStockAdjustment: adjustmentMutation.mutateAsync,
    isSavingProduct:
      createProductMutation.isPending || updateProductMutation.isPending,
    isSavingCategory: createCategoryMutation.isPending,
    isSavingStock: entryMutation.isPending || adjustmentMutation.isPending,
  };
}
