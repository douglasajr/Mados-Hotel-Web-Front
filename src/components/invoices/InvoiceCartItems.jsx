import { useState } from "react";
import { Minus, Plus, Trash2, Layers, Check, Pencil } from "lucide-react";
import { formatLPS } from "../../utils/invoices.constants";

export default function InvoiceCartItems({
  items, updateQty, removeItem, updateDesc, updatePrice,
  groupMode, setGroupMode, groupSelected, groupDesc, setGroupDesc,
  isGroupable, toggleGroupSelect, cancelGroupMode, createGroup,
}) {
  const [editingPrice, setEditingPrice] = useState(null);

  if (items.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-300 text-sm text-center">Selecciona ítems del catálogo</p>
      </div>
    );

  return (
    <>
      {/* Agrupar button */}
      {!groupMode && items.filter(isGroupable).length >= 2 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setGroupMode(true)}
            className="flex items-center gap-1 text-[11px] font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            <Layers size={11} />
            Agrupar ítems
          </button>
        </div>
      )}

      {items.map((item, index) => {
        const canSelect  = groupMode && isGroupable(item);
        const isSelected = groupSelected.has(index);
        const isRoom     = !!item.reservationId;

        return (
          <div
            key={index}
            onClick={canSelect ? () => toggleGroupSelect(index) : undefined}
            className={`flex items-start gap-2 p-2.5 rounded-xl transition-all ${
              canSelect
                ? isSelected
                  ? "bg-teal-50 border border-teal-300 cursor-pointer"
                  : "bg-gray-50 border border-gray-100 cursor-pointer hover:border-teal-200"
                : "bg-gray-50"
            }`}
          >
            {canSelect && (
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isSelected ? "border-teal-500 bg-teal-500" : "border-gray-300"}`}>
                {isSelected && <Check size={9} className="text-white" />}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <input
                value={item.description}
                onChange={(e) => updateDesc(index, e.target.value)}
                onClick={(e) => canSelect && e.stopPropagation()}
                className="text-xs font-medium text-gray-800 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-amber-400 focus:outline-none pb-0.5 truncate"
              />

              {/* Precio — editable si es habitación */}
              {isRoom ? (
                editingPrice === index ? (
                  <input
                    type="number"
                    autoFocus
                    defaultValue={item.unitPrice}
                    onBlur={(e) => {
                      updatePrice(index, e.target.value);
                      setEditingPrice(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { updatePrice(index, e.target.value); setEditingPrice(null); }
                      if (e.key === "Escape") setEditingPrice(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-amber-700 font-semibold w-full bg-amber-50 border border-amber-300 rounded px-1.5 py-0.5 mt-0.5 focus:outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setEditingPrice(index); }}
                    className="flex items-center gap-1 mt-0.5 group"
                  >
                    <span className="text-[10px] text-gray-400">{formatLPS(item.unitPrice)}</span>
                    <Pencil size={9} className="text-gray-300 group-hover:text-amber-400 transition-colors" />
                  </button>
                )
              ) : (
                <p className="text-[10px] text-gray-400 mt-0.5">{formatLPS(item.unitPrice)} c/u</p>
              )}

              {item.exemptionOrderNumber && (
                <p className="text-[10px] text-teal-600 font-medium mt-0.5">Exon. {item.exemptionOrderNumber}</p>
              )}
              {item._productItems && (
                <p className="text-[10px] text-teal-500 font-medium mt-0.5 flex items-center gap-0.5">
                  <Layers size={9} />{item._productItems.length} productos
                </p>
              )}
            </div>

            {isRoom || item._productItems ? (
              <span className="text-xs text-gray-400 shrink-0 mt-0.5 px-1">1×</span>
            ) : (
              <div className="flex items-center gap-1 shrink-0 mt-0.5" onClick={(e) => canSelect && e.stopPropagation()}>
                <button type="button" onClick={() => updateQty(index, item.quantity - 1)} className="w-5 h-5 rounded border bg-white flex items-center justify-center hover:bg-red-50 transition-colors"><Minus size={9} /></button>
                <span className="text-xs w-5 text-center font-semibold">{item.quantity}</span>
                <button type="button" onClick={() => updateQty(index, item.quantity + 1)} className="w-5 h-5 rounded border bg-white flex items-center justify-center hover:bg-green-50 transition-colors"><Plus size={9} /></button>
              </div>
            )}

            <span className="text-xs font-bold text-gray-800 w-20 text-right shrink-0 mt-0.5">
              {formatLPS(item.unitPrice * item.quantity)}
            </span>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeItem(index); }}
              className="text-gray-200 hover:text-red-400 shrink-0 transition-colors mt-0.5"
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      })}

      {/* Group mode panel */}
      {groupMode && (
        <div className="mt-1 p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-2">
          <p className="text-[11px] font-medium text-teal-700">
            {groupSelected.size < 2 ? "Selecciona al menos 2 ítems para agrupar" : `${groupSelected.size} ítems seleccionados`}
          </p>
          {groupSelected.size >= 2 && (
            <input
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (groupDesc.trim()) createGroup(groupDesc);
                }
              }}
              placeholder="Descripción del grupo (ej: Hidratación)"
              className="w-full text-xs h-7 px-2.5 rounded-lg border border-teal-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-400"
              autoFocus
            />
          )}
          <div className="flex gap-1.5">
            {groupSelected.size >= 2 && groupDesc.trim() && (
              <button type="button" onClick={() => createGroup(groupDesc)} className="flex-1 text-[11px] h-7 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors">
                Crear grupo
              </button>
            )}
            <button type="button" onClick={cancelGroupMode} className="flex-1 text-[11px] h-7 bg-white border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
