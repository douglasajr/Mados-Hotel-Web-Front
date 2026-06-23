import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useReservations } from "../../hooks/useReservations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarPlus, UserCheck, LogIn, Hotel, LogOut, LayoutList, Search } from "lucide-react";
import ReservationModal from "../../components/reservations/ReservationModal";
import WalkInModal from "../../components/reservations/WalkinModal";
import CheckoutModal from "../../components/reservations/CheckoutModal";
import ReservationTable from "../../components/reservations/ReservationTable";
import ReservationChargesModal from "../../components/reservations/ReservationChargesModal";
import EditDatesModal from "../../components/reservations/EditDatesModal";
import { getReservationsApi } from "../../api/reservations.api";

const getToday = () => new Date().toLocaleDateString("en-CA");

const FILTERS = [
  {
    key:       "ALL",
    label:     "Todas",
    icon:      LayoutList,
    color:     "bg-gray-100 text-gray-600",
    activeColor: "bg-gray-800 text-white",
    status:    undefined,
    dateField: null,
    countKey:  null,
  },
  {
    key:       "ARRIVALS",
    label:     "Llegan hoy",
    icon:      LogIn,
    color:     "bg-blue-100 text-blue-600",
    activeColor: "bg-blue-600 text-white",
    status:    "CONFIRMED",
    dateField: "checkInDate",
    countKey:  "arrivals",
  },
  {
    key:       "INHOUSE",
    label:     "En hotel",
    icon:      Hotel,
    color:     "bg-green-100 text-green-600",
    activeColor: "bg-green-600 text-white",
    status:    "CHECKED_IN",
    dateField: null,
    countKey:  "inhouse",
  },
  {
    key:       "DEPARTURES",
    label:     "Salen hoy",
    icon:      LogOut,
    color:     "bg-purple-100 text-purple-600",
    activeColor: "bg-purple-600 text-white",
    status:    "CHECKED_IN",
    dateField: "checkOutDate",
    countKey:  "departures",
  },
];

export default function ReservationsPage() {
  const [modal, setModal]             = useState(null);
  const [checkoutRes, setCheckoutRes] = useState(null);
  const [chargesResId, setChargesResId] = useState(null);
  const [editDatesRes, setEditDatesRes] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch]           = useState("");

  const today = getToday();

  const { data: arrivalsData,   isLoading: loadingArrivals }   = useQuery({
    queryKey: ["reservations-arrivals", today],
    queryFn:  () => getReservationsApi({ status: "CONFIRMED",  checkInDate: today,  limit: 100 }),
  });
  const { data: inhouseData,    isLoading: loadingInhouse }    = useQuery({
    queryKey: ["reservations-inhouse"],
    queryFn:  () => getReservationsApi({ status: "CHECKED_IN", limit: 100 }),
  });
  const { data: departuresData, isLoading: loadingDepartures } = useQuery({
    queryKey: ["reservations-departures", today],
    queryFn:  () => getReservationsApi({ status: "CHECKED_IN", checkOutDate: today, limit: 100 }),
  });

  const counts = {
    arrivals:   arrivalsData?.total   ?? 0,
    inhouse:    inhouseData?.total    ?? 0,
    departures: departuresData?.total ?? 0,
  };
  const loadingCounts = {
    arrivals:   loadingArrivals,
    inhouse:    loadingInhouse,
    departures: loadingDepartures,
  };

  const filter = FILTERS.find((f) => f.key === activeFilter);
  const tableFilters = {
    status: filter.status,
    ...(filter.dateField === "checkInDate"  && { checkInDate: today }),
    ...(filter.dateField === "checkOutDate" && { checkOutDate: today }),
    ...(search.trim() && { search: search.trim() }),
  };

  const {
    reservations, total, page, totalPages, isLoading,
    setPage, resetPage,
    createReservation, walkIn, checkIn, checkOut,
    cancelReservation, updateDates,
    isCreating, isWalkingIn, isCheckingOut, isUpdatingDates,
  } = useReservations(tableFilters);

  const handleFilterChange = (key) => { setActiveFilter(key); resetPage(); };

  const handleCheckout = async () => {
    if (!checkoutRes?.id) return;
    await checkOut({ id: checkoutRes.id });
    setCheckoutRes(null);
  };

  const handleUpdateDates = async (data) => {
    await updateDates(data);
    setEditDatesRes(null);
  };

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Reservaciones</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModal("walkin")}
            className="text-sm"
          >
            <UserCheck size={15} className="mr-1.5" />
            Venta directa
          </Button>
          <Button
            size="sm"
            onClick={() => setModal("create")}
            className="bg-amber-500 hover:bg-amber-600 text-white border-0 text-sm"
          >
            <CalendarPlus size={15} className="mr-1.5" />
            Nueva reservación
          </Button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          placeholder="Buscar huésped o habitación..."
          className="pl-8 h-9 text-sm"
        />
      </div>

      {/* Filtros / Estadísticas del día */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const Icon    = f.icon;
          const isActive = activeFilter === f.key;
          const count   = f.countKey ? counts[f.countKey] : null;
          const loading = f.countKey ? loadingCounts[f.countKey] : false;

          return (
            <button
              key={f.key}
              type="button"
              onClick={() => handleFilterChange(f.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all
                ${isActive
                  ? "border-transparent shadow-sm " + f.activeColor
                  : "bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50"}`}
            >
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors
                ${isActive ? "bg-white/20" : f.color}`}>
                <Icon size={14} />
              </span>
              {f.label}
              {count !== null && (
                <span className={`text-xs font-bold min-w-[18px] text-center
                  ${isActive ? "opacity-80" : "text-gray-400"}`}>
                  {loading ? "–" : count}
                </span>
              )}
            </button>
          );
        })}

        <span className="ml-auto self-center text-xs text-gray-400">
          {total} resultado{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-[3px] border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ReservationTable
          reservations={reservations}
          total={total}
          page={page}
          totalPages={totalPages}
          onCheckIn={checkIn}
          onCheckOut={setCheckoutRes}
          onCancel={cancelReservation}
          onPageChange={setPage}
          onViewCharges={(res) => setChargesResId(res.id)}
          onEditDates={(res) => setEditDatesRes(res)}
        />
      )}

      {/* Modales */}
      {modal === "create" && (
        <ReservationModal
          onClose={() => setModal(null)}
          onSave={createReservation}
          isSaving={isCreating}
        />
      )}
      {modal === "walkin" && (
        <WalkInModal
          onClose={() => setModal(null)}
          onSave={walkIn}
          isSaving={isWalkingIn}
        />
      )}
      {checkoutRes && (
        <CheckoutModal
          reservation={checkoutRes}
          onClose={() => setCheckoutRes(null)}
          onSave={handleCheckout}
          isSaving={isCheckingOut}
        />
      )}
      {chargesResId && (
        <ReservationChargesModal
          reservationId={chargesResId}
          onClose={() => setChargesResId(null)}
        />
      )}
      {editDatesRes && (
        <EditDatesModal
          reservation={editDatesRes}
          onClose={() => setEditDatesRes(null)}
          onSave={handleUpdateDates}
          isSaving={isUpdatingDates}
        />
      )}
    </div>
  );
}
