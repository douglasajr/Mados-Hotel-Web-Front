const ISV_RATES = {
  ROOM: 0.19,
  FOOD: 0.15,
  RECEPTION: 0.15,
  EXENTO: 0,
};

export const createEmptyInvoiceItem = () => ({
  description: "",
  quantity: 1,
  unitPrice: "",
  isvType: "RECEPTION",
  isExonerated: false,
});

export const isEmptyInvoiceItem = (item) =>
  !item.description && !item.unitPrice;

export const isValidInvoiceItem = (item) =>
  Boolean(item.description) && Number(item.unitPrice) > 0;

export const normalizeInvoiceItem = (item) => ({
  description: item.description,
  quantity: Number(item.quantity),
  unitPrice: Number(item.unitPrice),
  isvType: item.isvType,
  isExonerated: item.isExonerated,
  exemptionOrderNumber: item.exemptionOrderNumber ?? null,
});

export const buildPendingChargeItems = (charges) => {
  const items = [];

  if (charges?.roomCharges) {
    items.push({
      description: `${charges.roomCharges.description} (${charges.roomCharges.nights} noches)`,
      quantity: 1,
      unitPrice: charges.roomCharges.total,
      isvType: "ROOM",
      isExonerated: false,
    });
  }

  charges?.orders?.forEach((order) => {
    order.items?.forEach((item) => {
      items.push({
        description: item.menuItem?.name ?? "Producto",
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        isvType: "FOOD",
        isExonerated: false,
      });
    });
  });

  charges?.receptionSales?.forEach((sale) => {
    sale.items?.forEach((item) => {
      items.push({
        description: item.product?.name ?? "Producto",
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        isvType: "RECEPTION",
        isExonerated: false,
      });
    });
  });

  return items;
};

export const calculateInvoiceTotals = (items) =>
  items.reduce(
    (totals, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const lineTotal = qty * price;

      totals.grandTotal += lineTotal;

      if (item.isExonerated) {
        totals.isvExento += lineTotal;
        totals.subtotal += lineTotal;
        return totals;
      }

      const rate = ISV_RATES[item.isvType] ?? ISV_RATES.RECEPTION;
      const sinISV = lineTotal / (1 + rate);
      const isvAmount = lineTotal - sinISV;

      totals.subtotal += sinISV;

      if (item.isvType === "ROOM") {
        totals.isv4 += sinISV * 0.04;
        totals.isv15 += sinISV * 0.15;
      } else if (item.isvType === "FOOD" || item.isvType === "RECEPTION") {
        totals.isv15 += isvAmount;
      }

      return totals;
    },
    {
      subtotal: 0,
      isv15: 0,
      isv4: 0,
      isvExento: 0,
      grandTotal: 0,
    },
  );
