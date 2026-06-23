import api from "./axios.api";

export const getProductsApi = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data;
};

export const createProductApi = async (productData) => {
  const { data } = await api.post("/products", productData);
  return data;
};

export const updateProductApi = async (id, productData) => {
  const { data } = await api.put(`/products/${id}`, productData);
  return data;
};

export const toggleProductStatusApi = async (id, active) => {
  const { data } = await api.patch(`/products/${id}/status`, { active });
  return data;
};

export const getProductCategoriesApi = async () => {
  const { data } = await api.get("/categories");
  return data;
};

export const createProductCategoryApi = async (categoryData) => {
  const { data } = await api.post("/categories", categoryData);
  return data;
};

export const getStocksApi = async () => {
  const { data } = await api.get("/stock");
  return data;
};

export const registerStockEntryApi = async (entryData) => {
  const { data } = await api.post("/stock/entry", entryData);
  return data;
};

export const registerStockAdjustmentApi = async (adjustmentData) => {
  const { data } = await api.post("/stock/adjustment", adjustmentData);
  return data;
};
