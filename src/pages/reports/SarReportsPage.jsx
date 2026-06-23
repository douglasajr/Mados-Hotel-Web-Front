import { useState } from "react";
import { BarChart3, Calendar, Printer, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSarReport } from "../../hooks/useSarReport";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getFiscalConfigsApi, createFiscalConfigApi } from "../../api/fiscalConfig.api";

const fmt = (n) =>
  Number(n).toLocaleString("es-HN", { minimumFractionDigits: 2 });

// ─── Impresión del reporte SAR ─────────────────────────────────────────────
function printSarReport(report) {
  const { summary, dailyDetail, period } = report;

  const rows = (dailyDetail ?? [])
    .map(
      (d) => `
    <tr>
      <td>${new Date(d.date + "T12:00:00").toLocaleDateString("es-HN")}</td>
      <td>${d.noInicial ?? "—"}</td>
      <td>${d.noFinal ?? "—"}</td>
      <td class="num">L. ${fmt(d.gravado)}</td>
      <td class="num">L. ${fmt(d.isv15)}</td>
      <td class="num">L. ${fmt(d.isv18)}</td>
      <td class="num">L. ${fmt(d.isv4)}</td>
      <td class="num">L. ${fmt(d.exento)}</td>
      <td class="num">L. ${fmt(d.exonerado)}</td>
      <td class="num"><strong>L. ${fmt(d.total)}</strong></td>
    </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Reporte SAR ${period?.start ?? ""} — ${period?.end ?? ""}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #000; padding: 20px; }
  h1 { font-size: 16px; margin-bottom: 4px; }
  h2 { font-size: 13px; margin: 16px 0 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  .subtitle { color: #555; font-size: 11px; margin-bottom: 16px; }
  .summary { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
  .card { border: 1px solid #ddd; border-radius: 6px; padding: 10px 14px; min-width: 140px; }
  .card-label { font-size: 10px; color: #777; text-transform: uppercase; letter-spacing: .04em; }
  .card-value { font-size: 15px; font-weight: bold; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  th { background: #f3f3f3; text-align: left; padding: 6px 8px; border: 1px solid #ccc; }
  td { padding: 5px 8px; border: 1px solid #e5e5e5; }
  tr:nth-child(even) td { background: #fafafa; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .tfoot td { border-top: 2px solid #888; font-weight: bold; background: #f9f9f9; }
  @media print {
    body { padding: 10px; }
    @page { size: letter landscape; margin: 12mm; }
  }
</style>
</head>
<body>
<h1>Reporte SAR de Ventas</h1>
<p class="subtitle">
  Período: ${period?.start ?? ""} — ${period?.end ?? ""} &nbsp;·&nbsp;
  Generado: ${new Date().toLocaleDateString("es-HN")}
</p>

<div class="summary">
  <div class="card">
    <div class="card-label">Facturas fiscales</div>
    <div class="card-value">${summary?.totalInvoices ?? 0}</div>
  </div>
  <div class="card">
    <div class="card-label">ISV 15%</div>
    <div class="card-value">L. ${fmt(summary?.isv15 ?? 0)}</div>
  </div>
  <div class="card">
    <div class="card-label">ISV 4% (hosp.)</div>
    <div class="card-value">L. ${fmt(summary?.isv4 ?? 0)}</div>
  </div>
  <div class="card" style="border-color:#333">
    <div class="card-label">Total ventas</div>
    <div class="card-value">L. ${fmt(summary?.total ?? 0)}</div>
  </div>
</div>

<h2>Detalle diario</h2>
<table>
  <thead>
    <tr>
      <th>Fecha</th>
      <th>No. Inicial</th>
      <th>No. Final</th>
      <th class="num">Gravado</th>
      <th class="num">ISV 15%</th>
      <th class="num">ISV 18%</th>
      <th class="num">ISV 4%</th>
      <th class="num">Exento</th>
      <th class="num">Exonerado</th>
      <th class="num">Total</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
  <tfoot>
    <tr class="tfoot">
      <td colspan="3">TOTALES</td>
      <td class="num">L. ${fmt(summary?.gravado ?? 0)}</td>
      <td class="num">L. ${fmt(summary?.isv15 ?? 0)}</td>
      <td class="num">L. ${fmt(summary?.isv18 ?? 0)}</td>
      <td class="num">L. ${fmt(summary?.isv4 ?? 0)}</td>
      <td class="num">L. ${fmt(summary?.exento ?? 0)}</td>
      <td class="num">L. ${fmt(summary?.exonerado ?? 0)}</td>
      <td class="num">L. ${fmt(summary?.total ?? 0)}</td>
    </tr>
  </tfoot>
</table>
</body>
</html>`;

  const w = window.open("", "_blank", "width=1000,height=700");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 300);
}

// ─── Componentes reporte ────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, color = "bg-white" }) {
  return (
    <div className={`${color} rounded-xl p-4 border border-gray-100 shadow-sm`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ReportResult({ report, onPrint }) {
  const { summary, dailyDetail, period } = report;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Resultado del reporte</h2>
          <p className="text-sm text-gray-400 mt-0.5">{period?.start} — {period?.end}</p>
        </div>
        <Button onClick={onPrint} className="bg-gray-900 hover:bg-gray-800 text-white">
          <Printer size={15} className="mr-2" />
          Imprimir / PDF
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Facturas" value={summary.totalInvoices} />
        <SummaryCard label="Anulados" value={summary.totalVoided} color={summary.totalVoided > 0 ? "bg-red-50" : "bg-white"} />
        <SummaryCard label="ISV 15%" value={`L. ${fmt(summary.isv15)}`} />
        <SummaryCard label="ISV 4%" value={`L. ${fmt(summary.isv4)}`} sub="Hospedaje" />
        <SummaryCard label="Total ventas" value={`L. ${fmt(summary.total)}`} color="bg-amber-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Detalle diario</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {["Fecha","No. Inicial","No. Final","Gravado","ISV 15%","ISV 18%","ISV 4%","Exento","Exonerado"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(dailyDetail ?? []).map((d, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-700">{new Date(d.date + "T12:00:00").toLocaleDateString("es-HN")}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{d.noInicial}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{d.noFinal}</td>
                  {[d.gravado, d.isv15, d.isv18, d.isv4, d.exento, d.exonerado].map((v, j) => (
                    <td key={j} className="px-4 py-3 text-right text-gray-700">L. {fmt(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td className="px-4 py-3 font-bold text-gray-900 text-xs uppercase" colSpan={3}>Totales</td>
                {[summary.gravado ?? 0, summary.isv15, summary.isv18 ?? 0, summary.isv4, summary.exento ?? 0, summary.exonerado ?? 0].map((v, j) => (
                  <td key={j} className="px-4 py-3 text-right font-bold text-gray-900">L. {fmt(v)}</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Componente configuración CAI ───────────────────────────────────────────

const EMPTY_FORM = {
  businessName: '', rtn: '', cai: '', address: '', phone: '',
  caiExpiry: '', rangeStart: '', rangeEnd: '', currentCorrelative: '1',
}

function CaiField({ label, name, type = 'text', placeholder, form, onChange }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
      />
    </div>
  )
}

function FiscalConfigTab() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['fiscal-configs'],
    queryFn: getFiscalConfigsApi,
  })

  const createMutation = useMutation({
    mutationFn: createFiscalConfigApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fiscal-configs'] })
      toast.success('Configuración CAI registrada')
      setForm(EMPTY_FORM)
      setShowForm(false)
    },
    onError: (err) => {
      setFormError(err.response?.data?.error || 'Error al guardar')
    },
  })

  const active = configs.find((c) => c.active)
  const isExpired = active && new Date(active.caiExpiry) < new Date()

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    const required = ['businessName', 'rtn', 'cai', 'address', 'phone', 'caiExpiry', 'rangeStart', 'rangeEnd']
    for (const k of required) {
      if (!form[k]?.trim()) return setFormError('Todos los campos son obligatorios')
    }
    createMutation.mutate({
      ...form,
      currentCorrelative: Number(form.currentCorrelative) || 1,
    })
  }

  return (
    <div className="space-y-5">

      {/* Config activa */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Configuración activa</h2>
          <button
            onClick={() => { setShowForm((p) => !p); setFormError('') }}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors"
          >
            <Plus size={13} />
            Nueva configuración
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !active ? (
          <div className="flex items-center gap-3 px-5 py-5 text-amber-700 bg-amber-50">
            <AlertTriangle size={18} className="shrink-0" />
            <p className="text-sm">No hay configuración fiscal activa. Registra un CAI para poder emitir facturas.</p>
          </div>
        ) : (
          <div className="p-5">
            {isExpired && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertTriangle size={15} className="shrink-0" />
                El CAI venció el {new Date(active.caiExpiry).toLocaleDateString('es-HN')}. Registra una nueva configuración.
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              {[
                { label: 'Razón social', value: active.businessName },
                { label: 'RTN', value: active.rtn },
                { label: 'Teléfono', value: active.phone },
                { label: 'Dirección', value: active.address },
                { label: 'CAI', value: active.cai, mono: true },
                { label: 'Vencimiento CAI', value: new Date(active.caiExpiry).toLocaleDateString('es-HN'), highlight: isExpired ? 'text-red-600' : 'text-green-700' },
                { label: 'Rango inicial', value: active.rangeStart, mono: true },
                { label: 'Rango final', value: active.rangeEnd, mono: true },
                { label: 'Correlativo actual', value: String(active.currentCorrelative) },
              ].map(({ label, value, mono, highlight }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
                  <p className={`text-sm mt-0.5 font-medium ${highlight ?? 'text-gray-800'} ${mono ? 'font-mono' : ''}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-green-600">
              <CheckCircle2 size={13} />
              Configuración activa y válida
            </div>
          </div>
        )}
      </div>

      {/* Formulario nueva config */}
      {showForm && (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-100 bg-amber-50">
            <h3 className="text-sm font-semibold text-amber-800">Nueva configuración CAI</h3>
            <p className="text-xs text-amber-600 mt-0.5">Al guardar, la configuración actual quedará inactiva</p>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <CaiField label="Razón social" name="businessName" placeholder="Nombre fiscal del hotel" form={form} onChange={set} />
              <CaiField label="RTN" name="rtn" placeholder="0000-0000-000000" form={form} onChange={set} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CaiField label="Teléfono" name="phone" placeholder="2222-3333" form={form} onChange={set} />
              <CaiField label="Dirección" name="address" placeholder="Dirección fiscal" form={form} onChange={set} />
            </div>
            <CaiField label="CAI" name="cai" placeholder="000000-000000-000000-000000-000000-0" form={form} onChange={set} />
            <div className="grid grid-cols-2 gap-4">
              <CaiField label="Vencimiento CAI" name="caiExpiry" type="date" form={form} onChange={set} />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Correlativo inicial</p>
                <input
                  type="number"
                  min="1"
                  value={form.currentCorrelative}
                  onChange={(e) => set('currentCorrelative', e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CaiField label="Rango inicial de facturas" name="rangeStart" placeholder="001-001-01-00000001" form={form} onChange={set} />
              <CaiField label="Rango final de facturas" name="rangeEnd" placeholder="001-001-01-99999999" form={form} onChange={set} />
            </div>

            {formError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError('') }}
                className="flex-1 h-9 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 h-9 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? 'Guardando...' : 'Registrar configuración'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historial */}
      {configs.filter((c) => !c.active).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Historial de configuraciones</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {configs.filter((c) => !c.active).map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-mono">{c.cai}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Venció: {new Date(c.caiExpiry).toLocaleDateString('es-HN')} · Correlativo final: {c.currentCorrelative}
                  </p>
                </div>
                <span className="text-xs text-gray-400 font-medium px-2.5 py-1 rounded-full bg-gray-100">Inactiva</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Página principal ───────────────────────────────────────────────────────

export default function SarReportsPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  const [tab, setTab] = useState("reports");

  const [periodStart, setPeriodStart] = useState(`${currentYear}-${currentMonth}-01`);
  const [periodEnd, setPeriodEnd] = useState(new Date().toLocaleDateString("en-CA"));

  const { generateReport, isGenerating, generatedReport } = useSarReport();

  const handleGenerate = async (e) => {
    e.preventDefault();
    await generateReport({ periodStart, periodEnd });
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes SAR</h1>
        <p className="text-gray-400 text-sm mt-1">
          Reporte de ventas y configuración fiscal
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: "reports", label: "Reporte de ventas", icon: BarChart3 },
          { key: "config",  label: "Configuración CAI", icon: CheckCircle2 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "reports" && (
        <>
          {/* Formulario */}
          <form onSubmit={handleGenerate} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={15} className="text-amber-500" />
              Período a reportar
            </h2>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">Desde</label>
                <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="h-9 text-sm w-44" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">Hasta</label>
                <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="h-9 text-sm w-44" required />
              </div>
              <Button
                type="submit"
                disabled={isGenerating}
                className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-9"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <BarChart3 size={15} className="mr-2" />
                )}
                {isGenerating ? "Generando..." : "Generar reporte"}
              </Button>
            </div>
          </form>

          {generatedReport && (
            <ReportResult report={generatedReport} onPrint={() => printSarReport(generatedReport)} />
          )}
        </>
      )}

      {tab === "config" && <FiscalConfigTab />}
    </div>
  );
}
