import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, UtensilsCrossed, Package, Pencil, Search, Plus, ArrowLeft } from "lucide-react";
import { useInvoiceForm } from "../../components/invoices/useInvoiceForm";
import { useInvoices } from "../../hooks/useInvoices";
import InvoiceRoomTab from "../../components/invoices/InvoiceRoomTab";
import InvoiceManualTab from "../../components/invoices/InvoiceManualTab";
import InvoiceCartItems from "../../components/invoices/InvoiceCartItems";
import InvoiceBottomPanel from "../../components/invoices/InvoiceBottomPanel";
import SplitInvoiceModal from "../../components/invoices/SplitInvoiceModal";
import { buildPrintHtml } from "../../components/invoices/invoicePrint.template";
import { buildProformaInvoice } from "../../components/invoices/invoicePrint.utils";
import { getActiveFiscalConfigApi } from "../../api/fiscalConfig.api";
import { formatLPS } from "../../utils/invoices.constants";

const CATALOG_TABS = [
  { key: "room",     label: "Habitación",  Icon: BedDouble },
  { key: "menu",     label: "Restaurante", Icon: UtensilsCrossed },
  { key: "products", label: "Pulpería",    Icon: Package },
  { key: "manual",   label: "Manual",      Icon: Pencil },
];

export default function NewInvoicePage() {
  const navigate = useNavigate();
  const form = useInvoiceForm();
  const { createInvoice, isCreating } = useInvoices({});
  const [showSplitModal, setShowSplitModal] = useState(false);

  // Config fiscal del hotel (para el encabezado de la proforma). Solo lectura.
  const { data: fiscalConfig } = useQuery({
    queryKey: ["active-fiscal-config"],
    queryFn: getActiveFiscalConfigApi,
  });

  const handleClose = () => navigate("/invoices");

  // Proforma: documento informativo SIN valor fiscal. No llama al backend, no
  // consume correlativo, no afecta inventario ni crédito. Solo se imprime.
  const handleProforma = () => {
    if (form.items.length === 0) return;
    const proforma = buildProformaInvoice({
      items: form.items,
      totals: form.totals,
      resolvedCustomer: form.resolvedCustomer,
      selectedCustomer: form.selectedCustomer,
      payments: form.payments,
      isExonerada: form.isExonerada,
      globalExemptionOrder: form.globalExemptionOrder,
      fiscalConfig,
    });
    const w = window.open("", "_blank", "width=850,height=900");
    if (!w) return;
    w.document.write(buildPrintHtml(proforma, "PROFORMA"));
    w.document.close();
  };

  const handleSave = async (payload) => {
    await createInvoice(payload);
    navigate("/invoices");
  };

  const handleSplitSave = async (splits) => {
    const baseItems = form.items;
    const grandTotal = form.totals.grandTotal;
    const roomItems = baseItems.filter((i) => i.reservationId);
    const allReservationIds = [...new Set(roomItems.map((i) => i.reservationId))];

    for (let i = 0; i < splits.length; i++) {
      const split = splits[i];
      const fraction = Number(split.amount) / grandTotal;

      const splitItems = baseItems.map((item) => {
        const fractionalPrice = +(item.quantity * item.unitPrice * fraction).toFixed(2);
        const isvType = form.isExonerada ? "EXENTO" : item.isvType;
        const isExonerated = form.isExonerada || item.isExonerated;
        return {
          description: item.description,
          quantity: 1,
          unitPrice: fractionalPrice,
          isvType,
          isExonerated,
          exemptionOrderNumber: isExonerated
            ? (form.globalExemptionOrder.trim() || item.exemptionOrderNumber || null)
            : null,
        };
      });

      await createInvoice({
        isReceipt: form.isReceipt,
        // La primera porción "posee" la(s) habitación(es) y la marca como facturada.
        reservationIds: i === 0 && allReservationIds.length > 0 ? allReservationIds : undefined,
        // TODAS las porciones (incluida la primera) referencian la reserva solo para
        // mostrar las fechas de entrada/salida. Se usa splitSourceReservationId porque
        // NO es único (reservationId sí lo es) → soporta divisiones de 3+ pagos.
        splitSourceReservationId: allReservationIds.length > 0 ? allReservationIds[0] : undefined,
        guestId: split.guestId,
        companyId: split.companyId ?? null,
        customerName: split.customerName,
        customerRtn: split.customerRtn,
        paymentMethod: split.paymentMethod,
        paymentReference: split.paymentReference || undefined,
        items: splitItems,
      });
    }

    navigate("/invoices");
  };

  return (
    <div className="min-h-full lg:h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Facturas
        </button>
        <h1 className="flex-1 text-lg font-bold text-gray-900">Nueva venta</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => form.setIsReceipt(false)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${!form.isReceipt ? "bg-white text-amber-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            Factura fiscal
          </button>
          <button
            type="button"
            onClick={() => form.setIsReceipt(true)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${form.isReceipt ? "bg-white text-gray-700 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            Recibo interno
          </button>
        </div>
      </div>

      {/* Two-panel layout */}
      <form
        onSubmit={(e) => form.handleSubmit(e, handleSave, handleClose)}
        className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden"
      >
        {/* Catálogo */}
        <div className="flex flex-col lg:w-[55%] border-b lg:border-b-0 lg:border-r border-gray-100 lg:overflow-hidden bg-white">
          <div className="flex border-b border-gray-100 shrink-0">
            {CATALOG_TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => form.handleTabChange(key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors border-b-2 ${
                  form.activeTab === key ? "border-amber-500 text-amber-600" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon size={15} />{label}
              </button>
            ))}
          </div>

          {form.activeTab !== "manual" && (
            <div className="p-3 border-b border-gray-50 shrink-0">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={form.search}
                  onChange={(e) => form.setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-8 pr-3 h-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="h-[45vh] lg:h-auto lg:flex-1 overflow-y-auto p-3 space-y-1">
            {form.activeTab === "menu" && (
              form.filteredMenu.length === 0 ? (
                <p className="text-center text-gray-300 text-sm py-10">Sin resultados</p>
              ) : form.filteredMenu.map((item) => (
                <button key={item.id} type="button" onClick={() => form.addMenu(item)}
                  className="w-full flex justify-between items-center px-3 py-2.5 rounded-xl hover:bg-amber-50 text-left border border-transparent hover:border-amber-100 transition-all">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className="text-sm font-semibold text-amber-600">{formatLPS(item.price)}</span>
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center"><Plus size={11} className="text-amber-600" /></div>
                  </div>
                </button>
              ))
            )}

            {form.activeTab === "products" && (
              form.filteredProducts.length === 0 ? (
                <p className="text-center text-gray-300 text-sm py-10">Sin resultados</p>
              ) : form.filteredProducts.map((p) => (
                <button key={p.id} type="button" onClick={() => form.addProduct(p)}
                  className="w-full flex justify-between items-center px-3 py-2.5 rounded-xl hover:bg-blue-50 text-left border border-transparent hover:border-blue-100 transition-all">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category?.name ?? ""}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className="text-sm font-semibold text-blue-600">{formatLPS(p.price ?? 0)}</span>
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center"><Plus size={11} className="text-blue-600" /></div>
                  </div>
                </button>
              ))
            )}

            {form.activeTab === "room" && (
              <InvoiceRoomTab
                filteredRooms={form.filteredRooms}
                items={form.items}
                addRoomHospedaje={form.addRoomHospedaje}
                addRoomChargesByType={form.addRoomChargesByType}
              />
            )}

            {form.activeTab === "manual" && (
              <InvoiceManualTab
                manualDesc={form.manualDesc}             setManualDesc={form.setManualDesc}
                manualQty={form.manualQty}               setManualQty={form.setManualQty}
                manualPrice={form.manualPrice}           setManualPrice={form.setManualPrice}
                manualIsvType={form.manualIsvType}       setManualIsvType={form.setManualIsvType}
                manualExemptOrder={form.manualExemptOrder} setManualExemptOrder={form.setManualExemptOrder}
                addManual={form.addManual}
              />
            )}
          </div>
        </div>

        {/* Carrito */}
        <div className="flex flex-col lg:w-[45%] lg:overflow-hidden bg-white">
          <div className="lg:flex-1 overflow-y-auto p-4 space-y-2">
            <InvoiceCartItems
              items={form.items}
              updateQty={form.updateQty}
              removeItem={form.removeItem}
              updateDesc={form.updateDesc}
              updatePrice={form.updatePrice}
              groupMode={form.groupMode}
              setGroupMode={form.setGroupMode}
              groupSelected={form.groupSelected}
              groupDesc={form.groupDesc}
              setGroupDesc={form.setGroupDesc}
              isGroupable={form.isGroupable}
              toggleGroupSelect={form.toggleGroupSelect}
              cancelGroupMode={form.cancelGroupMode}
              createGroup={form.createGroup}
            />
          </div>

          <InvoiceBottomPanel
            items={form.items}
            totals={form.totals}
            isReceipt={form.isReceipt}
            selectedCustomer={form.selectedCustomer}
            billedAs={form.billedAs}
            setBilledAs={form.setBilledAs}
            resolvedCustomer={form.resolvedCustomer}
            customerSearch={form.customerSearch}
            setCustomerSearch={form.setCustomerSearch}
            guestResults={form.guestResults}
            companyResults={form.companyResults}
            handleSelectGuest={form.handleSelectGuest}
            handleSelectCompany={form.handleSelectCompany}
            clearCustomer={form.clearCustomer}
            companyGuest={form.companyGuest}
            setCompanyGuest={form.setCompanyGuest}
            companyGuestSearch={form.companyGuestSearch}
            setCompanyGuestSearch={form.setCompanyGuestSearch}
            companyGuestResults={form.companyGuestResults}
            isExonerada={form.isExonerada}
            setIsExonerada={form.setIsExonerada}
            globalExemptionOrder={form.globalExemptionOrder}
            setGlobalExemptionOrder={form.setGlobalExemptionOrder}
            payments={form.payments}
            setPaymentRow={form.setPaymentRow}
            addPaymentRow={form.addPaymentRow}
            removePaymentRow={form.removePaymentRow}
            cashChange={form.cashChange}
            error={form.error}
            isSaving={isCreating}
            onClose={handleClose}
            onSplitInvoice={() => setShowSplitModal(true)}
            onProforma={handleProforma}
          />

          {showSplitModal && (
            <SplitInvoiceModal
              totals={form.totals}
              onConfirm={handleSplitSave}
              onClose={() => setShowSplitModal(false)}
            />
          )}
        </div>
      </form>
    </div>
  );
}
