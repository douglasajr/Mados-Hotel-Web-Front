const UNITS = ["","UN","DOS","TRES","CUATRO","CINCO","SEIS","SIETE","OCHO","NUEVE","DIEZ","ONCE","DOCE","TRECE","CATORCE","QUINCE","DIECISÉIS","DIECISIETE","DIECIOCHO","DIECINUEVE"];
const TENS  = ["","","VEINTE","TREINTA","CUARENTA","CINCUENTA","SESENTA","SETENTA","OCHENTA","NOVENTA"];
const HUNDREDS = ["","CIENTO","DOSCIENTOS","TRESCIENTOS","CUATROCIENTOS","QUINIENTOS","SEISCIENTOS","SETECIENTOS","OCHOCIENTOS","NOVECIENTOS"];

export function numberToWords(n) {
  if (n === 0) return "CERO";
  if (n < 0) return "MENOS " + numberToWords(-n);
  let result = "";
  if (n >= 1000000) { const m = Math.floor(n / 1000000); result += (m === 1 ? "UN MILLÓN" : numberToWords(m) + " MILLONES") + " "; n %= 1000000; }
  if (n >= 1000)    { const t = Math.floor(n / 1000);    result += (t === 1 ? "MIL" : numberToWords(t) + " MIL") + " "; n %= 1000; }
  if (n >= 100)     { result += (n === 100 ? "CIEN" : HUNDREDS[Math.floor(n / 100)]) + " "; n %= 100; }
  if (n >= 20)      { result += TENS[Math.floor(n / 10)]; if (n % 10 !== 0) result += " Y " + UNITS[n % 10]; result += " "; }
  else if (n > 0)   { result += UNITS[n] + " "; }
  return result.trim();
}

export function amountToWords(amount) {
  const total    = Math.round(Number(amount) * 100);
  const lempiras = Math.floor(total / 100);
  const centavos = total % 100;
  return `${numberToWords(lempiras)} ${lempiras === 1 ? "LEMPIRA" : "LEMPIRAS"} CON ${String(centavos).padStart(2, "0")}/100`;
}

export const ISV_RATES = { ROOM: 0.19, FOOD: 0.15, RECEPTION: 0.15, EXENTO: 0 };

export function calcItemBreakdown(item) {
  const totalConISV = Number(item.subtotal);
  const unitConISV  = Number(item.unitPrice);
  if (item.isExonerated) {
    return { unitSin: unitConISV, gravado: 0, isv15: 0, isv4: 0, exonerado: totalConISV, exento: 0, total: totalConISV };
  }
  const rate   = ISV_RATES[item.isvType] ?? 0.15;
  const sinISV = totalConISV / (1 + rate);
  const isv4   = item.isvType === "ROOM" ? sinISV * 0.04 : 0;
  const isv15  = item.isvType === "ROOM" ? sinISV * 0.15 : (totalConISV - sinISV);
  return { unitSin: unitConISV / (1 + rate), gravado: sinISV, isv15, isv4, exonerado: 0, exento: 0, total: totalConISV };
}
