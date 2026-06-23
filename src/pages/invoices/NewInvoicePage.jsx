import { useNavigate } from "react-router-dom";
import { BedDouble, UtensilsCrossed, Package, Pencil, Search, Plus, ArrowLeft } from "lucide-react";
import { useInvoiceForm } from "../../components/invoices/useInvoiceForm";
import { useInvoices } from "../../hooks/useInvoices";
import InvoiceRoomTab from "../../components/invoices/InvoiceRoomTab";
import InvoiceManualTab from "../../components/invoices/InvoiceManualTab";
import InvoiceCartItems from "../../components/invoices/InvoiceCartItems";
import InvoiceBottomPanel from "../../components/invoices/InvoiceBottomPanel";
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

  const handleClose = () => navigate("/invoices");

  const handleSave = async (payload) => {
    await createInvoice(payload);
    navigate("/invoices");
  };

  return (
    <div className="h-full flex flex-col">
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
        className="flex flex-col md:flex-row flex-1 overflow-hidden"
      >
        {/* Catálogo */}
        <div className="flex flex-col md:w-[55%] border-r border-gray-100 overflow-hidden bg-white">
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

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
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
        <div className="flex flex-col md:w-[45%] overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
            isExonerada={form.isExonerada}
            setIsExonerada={form.setIsExonerada}
            globalExemptionOrder={form.globalExemptionOrder}
            setGlobalExemptionOrder={form.setGlobalExemptionOrder}
            paymentMethod={form.paymentMethod}
            setPaymentMethod={form.setPaymentMethod}
            cashReceived={form.cashReceived}
            setCashReceived={form.setCashReceived}
            change={form.change}
            paymentReference={form.paymentReference}
            setPaymentReference={form.setPaymentReference}
            error={form.error}
            isSaving={isCreating}
            onClose={handleClose}
          />
        </div>
      </form>
    </div>
  );
}
