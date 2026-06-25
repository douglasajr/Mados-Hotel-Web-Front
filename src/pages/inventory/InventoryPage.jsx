import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  ClipboardPlus,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  Power,
  Search,
  SlidersHorizontal,
  Tags,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProductModal from "../../components/inventory/ProductModal";
import CategoryModal from "../../components/inventory/CategoryModal";
import StockMovementModal from "../../components/inventory/StockMovementModal";
import { useInventory } from "../../hooks/useInventory";
import { formatLPS } from "../../utils/invoices.constants";

const SCOPE_LABELS = {
  PULPERIA: "Pulpería",
  COCINA: "Cocina",
  LIMPIEZA: "Limpieza",
  GENERAL: "General",
};

const getCategoryScope = (product) => product.category?.scope ?? "GENERAL";
const isActive = (product) => product.active !== false;

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={19} className="text-white" />
      </div>
    </div>
  </div>
);

export default function InventoryPage() {
  const [productModal, setProductModal] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [stockModal, setStockModal] = useState(null);
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");

  const {
    products,
    categories,
    isLoading,
    isRefreshing,
    createProduct,
    updateProduct,
    toggleProductStatus,
    createCategory,
    registerStockEntry,
    registerStockAdjustment,
    isSavingProduct,
    isSavingCategory,
    isSavingStock,
  } = useInventory();

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name?.toLowerCase().includes(normalizedSearch) ||
        product.category?.name?.toLowerCase().includes(normalizedSearch);
      const matchesScope =
        scopeFilter === "ALL" || getCategoryScope(product) === scopeFilter;
      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "LOW" && product.lowStock) ||
        (stockFilter === "OUT" && product.currentStock === 0) ||
        (stockFilter === "ACTIVE" && isActive(product)) ||
        (stockFilter === "INACTIVE" && !isActive(product));

      return matchesSearch && matchesScope && matchesStock;
    });
  }, [products, scopeFilter, search, stockFilter]);

  const stats = useMemo(() => {
    const activeProducts = products.filter(isActive);
    const lowStock = products.filter((product) => product.lowStock);
    const outOfStock = products.filter((product) => product.currentStock === 0);
    const inventoryValue = products.reduce(
      (sum, product) =>
        sum + Number(product.price ?? 0) * Number(product.currentStock ?? 0),
      0,
    );

    return {
      total: products.length,
      active: activeProducts.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      inventoryValue,
    };
  }, [products]);

  const handleSaveProduct = async (data) => {
    if (productModal?.id) {
      await updateProduct({ id: productModal.id, ...data });
    } else {
      await createProduct(data);
    }
  };

  const handleSaveStock = async (data) => {
    if (stockModal?.mode === "adjustment") {
      await registerStockAdjustment(data);
    } else {
      await registerStockEntry(data);
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">
            {stats.total} productos · {formatLPS(stats.inventoryValue)} en stock
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowCategoryModal(true)}>
            <Tags size={16} className="mr-2" />
            Categoría
          </Button>
          <Button
            variant="outline"
            onClick={() => setStockModal({ mode: "entry", product: null })}
          >
            <ClipboardPlus size={16} className="mr-2" />
            Entrada
          </Button>
          <Button
            onClick={() => setProductModal("create")}
            className="bg-linear-to-r from-amber-500 to-orange-500
                       hover:from-amber-600 hover:to-orange-600 text-white border-0"
          >
            <Plus size={16} className="mr-2" />
            Nuevo producto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Productos activos"
          value={stats.active}
          icon={Package}
          color="bg-blue-600"
        />
        <StatCard
          title="Stock bajo"
          value={stats.lowStock}
          icon={AlertTriangle}
          color="bg-yellow-500"
        />
        <StatCard
          title="Sin stock"
          value={stats.outOfStock}
          icon={Archive}
          color="bg-red-500"
        />
        <StatCard
          title="Categorías"
          value={categories.length}
          icon={Tags}
          color="bg-emerald-600"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <Input
            placeholder="Buscar producto o categoría..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <Select value={scopeFilter} onValueChange={setScopeFilter}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las áreas</SelectItem>
            {Object.entries(SCOPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="ACTIVE">Activos</SelectItem>
            <SelectItem value="INACTIVE">Inactivos</SelectItem>
            <SelectItem value="LOW">Stock bajo</SelectItem>
            <SelectItem value="OUT">Sin stock</SelectItem>
          </SelectContent>
        </Select>

        {isRefreshing && (
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <SlidersHorizontal size={13} />
            Actualizando
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const active = isActive(product);
              const scope = getCategoryScope(product);

              return (
                <TableRow key={product.id} className={isRefreshing ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                        <Package size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        {product.invoiceDescription && (
                          <p className="text-xs text-gray-400">
                            {product.invoiceDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-700">
                        {product.category?.name ?? "Sin categoría"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {SCOPE_LABELS[scope] ?? scope}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm font-semibold text-gray-900">
                    {formatLPS(product.price)}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {product.currentStock}
                      </span>
                      <span className="text-xs text-gray-400">
                        mín. {product.minStock}
                      </span>
                      {product.lowStock && (
                        <AlertTriangle size={14} className="text-yellow-500" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        active
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      }
                    >
                      {active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setProductModal(product)}>
                          <Pencil size={14} className="mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setStockModal({ mode: "entry", product })
                          }
                        >
                          <ClipboardPlus size={14} className="mr-2" />
                          Entrada
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setStockModal({ mode: "adjustment", product })
                          }
                        >
                          <SlidersHorizontal size={14} className="mr-2" />
                          Ajustar stock
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toggleProductStatus({
                              id: product.id,
                              active: !active,
                            })
                          }
                        >
                          <Power size={14} className="mr-2" />
                          {active ? "Desactivar" : "Activar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {products.length
                ? "No se encontraron productos con ese criterio"
                : "No hay productos registrados"}
            </p>
            {products.length === 0 && (
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => setProductModal("create")}
              >
                Crear primer producto
              </Button>
            )}
          </div>
        )}
      </div>

      {productModal && (
        <ProductModal
          product={productModal === "create" ? null : productModal}
          categories={categories}
          onClose={() => setProductModal(null)}
          onSave={handleSaveProduct}
          isSaving={isSavingProduct}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSave={createCategory}
          isSaving={isSavingCategory}
        />
      )}

      {stockModal && (
        <StockMovementModal
          product={stockModal.product}
          products={products.filter(isActive)}
          mode={stockModal.mode}
          onClose={() => setStockModal(null)}
          onSave={handleSaveStock}
          isSaving={isSavingStock}
        />
      )}
    </div>
  );
}
