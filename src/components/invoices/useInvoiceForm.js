import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMenuApi } from "../../api/menu.api";
import { getProductsApi } from "../../api/inventory.api";
import { getReservationsApi } from "../../api/reservations.api";
import { getCompaniesApi } from "../../api/companies.api";
import { getGuestsApi } from "../../api/guests.api";
import { calculateInvoiceTotals, normalizeInvoiceItem } from "../../utils/invoices.helpers";

export function useInvoiceForm() {
  const [isReceipt, setIsReceipt]                   = useState(false);
  const [activeTab, setActiveTab]                   = useState("menu");
  const [search, setSearch]                         = useState("");
  const [items, setItems]                           = useState([]);
  const [groupMode, setGroupMode]                   = useState(false);
  const [groupSelected, setGroupSelected]           = useState(new Set());
  const [groupDesc, setGroupDesc]                   = useState("");
  const [customerSearch, setCustomerSearch]         = useState("");
  const [selectedCustomer, setSelectedCustomer]     = useState(null);
  const [billedAs, setBilledAs]                     = useState("guest");
  const [paymentMethod, setPaymentMethod]           = useState("");
  const [cashReceived, setCashReceived]             = useState("");
  const [paymentReference, setPaymentReference]     = useState("");
  const [isExonerada, setIsExonerada]               = useState(false);
  const [globalExemptionOrder, setGlobalExemptionOrder] = useState("");
  const [manualDesc, setManualDesc]                 = useState("");
  const [manualQty, setManualQty]                   = useState("1");
  const [manualPrice, setManualPrice]               = useState("");
  const [manualIsvType, setManualIsvType]           = useState("RECEPTION");
  const [manualExemptOrder, setManualExemptOrder]   = useState("");
  const [error, setError]                           = useState("");

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: menuItems = [] } = useQuery({ queryKey: ["menu-items"], queryFn: getMenuApi, enabled: activeTab === "menu" });

  const { data: productsRaw } = useQuery({ queryKey: ["products-catalog"], queryFn: getProductsApi, enabled: activeTab === "products" });
  const products = Array.isArray(productsRaw) ? productsRaw : [];

  const { data: checkedInData } = useQuery({
    queryKey: ["checked-in-guests"],
    queryFn: () => getReservationsApi({ status: "CHECKED_IN", limit: 100 }),
    enabled: activeTab === "room",
  });
  const reservations = checkedInData?.data ?? [];

  const { data: guestSearchData } = useQuery({
    queryKey: ["guests-search-invoice", customerSearch],
    queryFn: () => getGuestsApi({ search: customerSearch, limit: 5 }),
    enabled: !selectedCustomer && customerSearch.length >= 2,
  });
  const guestResults = guestSearchData?.data ?? [];

  const { data: companySearchData } = useQuery({
    queryKey: ["companies-search-invoice", customerSearch],
    queryFn: () => getCompaniesApi({ search: customerSearch, status: "ACTIVE", limit: 4 }),
    enabled: !selectedCustomer && customerSearch.length >= 2,
  });
  const companyResults = companySearchData?.data ?? companySearchData ?? [];

  // ── Catalog filters ───────────────────────────────────────────────────────

  const q = search.trim().toLowerCase();
  const filteredMenu = menuItems.filter((i) => i.available && (!q || i.name.toLowerCase().includes(q) || (i.category ?? "").toLowerCase().includes(q)));
  const filteredProducts = products.filter((p) => p.active !== false && Number(p.stock?.[0]?.quantity ?? 0) > 0 && (!q || p.name.toLowerCase().includes(q) || (p.category?.name ?? "").toLowerCase().includes(q)));
  const filteredRooms = reservations.filter((r) => !q || (r.guest?.fullName ?? "").toLowerCase().includes(q) || String(r.room?.number ?? "").includes(q));

  // ── Cart operations ───────────────────────────────────────────────────────

  const pushItem = (newItem) =>
    setItems((prev) => {
      if (!newItem._key) return [...prev, newItem];
      const existing = prev.find((i) => i._key === newItem._key);
      if (existing) return prev.map((i) => i._key === newItem._key ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, newItem];
    });

  const updateQty = (index, qty) => {
    if (qty <= 0) setItems((prev) => prev.filter((_, i) => i !== index));
    else setItems((prev) => prev.map((item, i) => i === index ? { ...item, quantity: qty } : item));
  };

  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));
  const updateDesc = (index, desc) => setItems((prev) => prev.map((item, i) => (i === index ? { ...item, description: desc } : item)));
  const updatePrice = (index, price) => setItems((prev) => prev.map((item, i) => (i === index ? { ...item, unitPrice: Number(price) || 0 } : item)));

  // ── Grouping ──────────────────────────────────────────────────────────────

  const isGroupable = (item) => !item.reservationId;

  const toggleGroupSelect = (index) => {
    if (!isGroupable(items[index])) return;
    setGroupSelected((prev) => { const next = new Set(prev); next.has(index) ? next.delete(index) : next.add(index); return next; });
  };

  const cancelGroupMode = () => { setGroupMode(false); setGroupSelected(new Set()); setGroupDesc(""); };

  const createGroup = (explicitDesc) => {
    const description = (typeof explicitDesc === "string" ? explicitDesc : groupDesc).trim();
    if (groupSelected.size < 2 || !description) return;
    const capturedIndices = new Set(groupSelected);
    const sel = [...capturedIndices].sort((a, b) => a - b).map((i) => items[i]);
    const groupPrice = sel.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    const allProductItems = sel.flatMap((item) => {
      if (item._reservationChargeId) return []; // stock already handled at charge-add time
      if (item._reservationChargeIds) return []; // already-grouped reservation charges
      if (item._productId) return [{ productId: item._productId, quantity: item.quantity, unitPrice: item._productUnitPrice }];
      if (item._productItems) return item._productItems;
      return [];
    });
    const chargeIds = sel.flatMap((item) => {
      if (item._reservationChargeId) return [item._reservationChargeId];
      if (item._reservationChargeIds) return item._reservationChargeIds;
      return [];
    });
    setItems((prev) => [
      ...prev.filter((_, i) => !capturedIndices.has(i)),
      {
        _key: null,
        _productItems: allProductItems.length > 0 ? allProductItems : undefined,
        _reservationChargeIds: chargeIds.length > 0 ? chargeIds : undefined,
        description, quantity: 1, unitPrice: groupPrice, isvType: "RECEPTION", isExonerated: false,
      },
    ]);
    cancelGroupMode();
  };

  // ── Item factories ────────────────────────────────────────────────────────

  const addMenu = (item) => pushItem({ _key: `menu-${item.id}`, description: item.name, quantity: 1, unitPrice: Number(item.price), isvType: "FOOD", isExonerated: false });

  const addProduct = (p) => pushItem({ _key: `product-${p.id}`, _productId: p.id, _productUnitPrice: Number(p.price ?? 0), description: p.name, quantity: 1, unitPrice: Number(p.price ?? 0), isvType: "RECEPTION", isExonerated: false });

  const addRoomHospedaje = (res) => {
    const roomKey = `room-${res.id}`;
    if (items.some((i) => i._key === roomKey)) return;
    const rc = res.roomCharged;
    const nights = rc?.nights ?? Math.max(1, Math.ceil((new Date(res.checkOut) - new Date(res.checkIn)) / (1000 * 60 * 60 * 24)));
    const total  = rc ? Number(rc.total) : Number(res.totalAmount);
    const desc   = rc?.description ?? `Hospedaje Hab. ${res.room?.number} (${nights} noche${nights !== 1 ? "s" : ""})`;
    pushItem({ _key: roomKey, reservationId: res.id, description: desc, quantity: 1, unitPrice: total, isvType: "ROOM", isExonerated: false });
    if (!selectedCustomer && res.guest) handleSelectGuest(res.guest);
  };

  const addRoomChargesByType = (res, isvType) => {
    const pending = (res.reservationCharges ?? []).filter((c) => !c.invoiceId && c.isvType === isvType);
    for (const c of pending) {
      if (items.some((i) => i._key === `rescharge-${c.id}`)) continue;
      pushItem({
        _key: `rescharge-${c.id}`,
        _reservationChargeId: c.id,
        _productId: c.productId ?? undefined,
        description: c.description,
        quantity: Number(c.quantity),
        unitPrice: Number(c.unitPrice),
        isvType: c.isvType,
        isExonerated: false,
      });
    }
    if (!selectedCustomer && res.guest) handleSelectGuest(res.guest);
  };

  const addManual = () => {
    if (!manualDesc.trim() || !manualPrice || Number(manualPrice) <= 0) return;
    const isExo = manualIsvType === "EXENTO";
    pushItem({ _key: null, description: manualDesc.trim(), quantity: Number(manualQty) || 1, unitPrice: Number(manualPrice), isvType: manualIsvType, isExonerated: isExo, exemptionOrderNumber: isExo ? manualExemptOrder.trim() || null : null });
    setManualDesc(""); setManualPrice(""); setManualQty("1"); setManualExemptOrder("");
  };

  // ── Customer ──────────────────────────────────────────────────────────────

  const handleSelectGuest = (guest) => {
    setSelectedCustomer({ type: "guest", ...guest });
    setBilledAs(guest.company ? "company" : "guest");
    setCustomerSearch("");
    if (paymentMethod === "CREDIT" && !guest.company?.hasCredit) setPaymentMethod("");
  };

  const handleSelectCompany = (company) => {
    setSelectedCustomer({ type: "company", ...company });
    setBilledAs("company");
    setCustomerSearch("");
    if (paymentMethod === "CREDIT" && !company.hasCredit) setPaymentMethod("");
  };

  const clearCustomer = () => {
    setSelectedCustomer(null); setBilledAs("guest"); setCustomerSearch("");
    if (paymentMethod === "CREDIT") setPaymentMethod("");
  };

  const resolvedCustomer = useMemo(() => {
    if (!selectedCustomer) return { name: "Consumidor Final", rtn: undefined, companyId: null, hasCredit: false };
    if (selectedCustomer.type === "company") return { name: selectedCustomer.name, rtn: selectedCustomer.rtn, companyId: selectedCustomer.id, hasCredit: selectedCustomer.hasCredit };
    if (billedAs === "company" && selectedCustomer.company) return { name: selectedCustomer.company.name, rtn: selectedCustomer.company.rtn, companyId: selectedCustomer.company.id, hasCredit: selectedCustomer.company.hasCredit };
    return { name: selectedCustomer.fullName, rtn: selectedCustomer.rtn || undefined, companyId: null, hasCredit: false };
  }, [selectedCustomer, billedAs]);

  // ── Totals ────────────────────────────────────────────────────────────────

  const totals = useMemo(
    () => calculateInvoiceTotals(items.map((i) => ({ ...i, quantity: String(i.quantity), unitPrice: String(i.unitPrice), isExonerated: isExonerada ? true : i.isExonerated, isvType: isExonerada ? "EXENTO" : i.isvType }))),
    [items, isExonerada],
  );

  const change = useMemo(() => {
    if (paymentMethod !== "CASH" || !cashReceived) return null;
    return Number(cashReceived) - totals.grandTotal;
  }, [paymentMethod, cashReceived, totals.grandTotal]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e, onSave, onClose) => {
    e.preventDefault();
    setError("");
    if (items.length === 0) return setError("Agrega al menos un ítem");
    if (!paymentMethod) return setError("Selecciona el método de pago");
    if (paymentMethod === "CASH" && cashReceived && Number(cashReceived) < totals.grandTotal) return setError("El monto recibido es menor que el total");
    try {
      const roomItem  = items.find((i) => i.reservationId);
      const productItems = items.flatMap((i) => {
        if (i._reservationChargeId) return []; // stock already handled when charge was added
        if (i._productId) return [{ productId: i._productId, quantity: i.quantity, unitPrice: i._productUnitPrice }];
        if (i._productItems?.length > 0) return i._productItems;
        return [];
      });
      const reservationChargeIds = items.flatMap((i) => {
        if (i._reservationChargeId) return [i._reservationChargeId];
        if (i._reservationChargeIds) return i._reservationChargeIds;
        return [];
      });
      await onSave({
        isReceipt,
        reservationId: roomItem?.reservationId ?? null,
        guestId: (!isReceipt && selectedCustomer?.type === "guest") ? selectedCustomer.id : null,
        companyId: !isReceipt ? resolvedCustomer.companyId : null,
        customerName: !isReceipt ? resolvedCustomer.name : "Consumidor Final",
        customerRtn: !isReceipt ? resolvedCustomer.rtn : undefined,
        paymentMethod,
        paymentReference: ["CARD", "TRANSFER"].includes(paymentMethod) && paymentReference ? paymentReference : undefined,
        productItems: productItems.length > 0 ? productItems : undefined,
        reservationChargeIds: reservationChargeIds.length > 0 ? reservationChargeIds : undefined,
        items: items.map((i) => normalizeInvoiceItem(isExonerada ? { ...i, isExonerated: true, isvType: "EXENTO", exemptionOrderNumber: globalExemptionOrder.trim() || null } : i)),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al generar el documento");
    }
  };

  const handleTabChange = (key) => { setActiveTab(key); setSearch(""); };

  return {
    isReceipt, setIsReceipt, activeTab, handleTabChange, search, setSearch,
    items, groupMode, setGroupMode, groupSelected, groupDesc, setGroupDesc,
    isGroupable, toggleGroupSelect, cancelGroupMode, createGroup,
    updateQty, removeItem, updateDesc, updatePrice,
    addMenu, addProduct, addRoomHospedaje, addRoomChargesByType, addManual,
    customerSearch, setCustomerSearch, selectedCustomer, billedAs, setBilledAs,
    resolvedCustomer, guestResults, companyResults,
    handleSelectGuest, handleSelectCompany, clearCustomer,
    paymentMethod, setPaymentMethod, cashReceived, setCashReceived,
    paymentReference, setPaymentReference,
    isExonerada, setIsExonerada, globalExemptionOrder, setGlobalExemptionOrder,
    manualDesc, setManualDesc, manualQty, setManualQty,
    manualPrice, setManualPrice, manualIsvType, setManualIsvType,
    manualExemptOrder, setManualExemptOrder,
    error, totals, change,
    filteredMenu, filteredProducts, filteredRooms,
    handleSubmit,
  };
}
