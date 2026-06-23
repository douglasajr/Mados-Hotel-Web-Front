import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Generar array de páginas a mostrar
  const getPages = () => {
    const pages = [];
    const delta = 2; // páginas a mostrar a cada lado de la actual

    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(totalPages, page + delta);
      i++
    ) {
      pages.push(i);
    }

    // Agregar primera página si no está
    if (pages[0] > 1) {
      if (pages[0] > 2) pages.unshift("...");
      pages.unshift(1);
    }

    // Agregar última página si no está
    if (pages[pages.length - 1] < totalPages) {
      if (pages[pages.length - 1] < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <p className="text-sm text-gray-500">
        Página {page} de {totalPages}
      </p>

      <div className="flex items-center gap-1">
        {/* Anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft size={16} />
        </Button>

        {/* Páginas */}
        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(p)}
              className="w-9"
            >
              {p}
            </Button>
          ),
        )}

        {/* Siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
