import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import LoginPage from "../pages/auth/LoginPage";
import SelectHotelPage from "../pages/auth/SelectHotelPage";
import MainLayout from "../components/layout/MainLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import WelcomePage from "../pages/welcome/WelcomePage";
import UsersPage from "../pages/users/UsersPages";
import RoomsPage from "../pages/rooms/RoomsPages";
import GuestsPage from "../pages/guests/GuestPage";
import CompaniesPage from "../pages/companies/CompaniesPages";
import ReservationsPage from "../pages/reservation/ReservationPage";
import ViewReservationsPage from "../pages/reservation/ViewReservationsPage";
import CreateReservationPage from "../pages/reservation/CreateReservationPage";
import InvoicesPage from "../pages/invoices/InvoicesPage";
import NewInvoicePage from "../pages/invoices/NewInvoicePage";
import InventoryPage from "../pages/inventory/InventoryPage";
import RestaurantPage from "../pages/restaurant/RestaurantPage";
import SarReportsPage from "../pages/reports/SarReportsPage";
import RoomChargedPage from "../pages/room-charged/RoomChargedPage";
import HotelsPage from "../pages/admin/HotelsPage";
import ShiftsPage from "../pages/shifts/ShiftsPage";
import CashCollectionsPage from "../pages/cash-collections/CashCollectionsPage";

const ADMIN_ROLES  = ["SUPERADMIN", "ADMIN"];
const STAFF_ROLES  = ["RECEPTIONIST", "CASHIER", "WAITER"];

const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" />;
};

const TempTokenRoute = ({ children }) => {
  const tempToken = useAuthStore((s) => s.tempToken);
  const token     = useAuthStore((s) => s.token);
  // tempToken tiene prioridad: permite cambiar hotel incluso si el token principal aún existe
  if (tempToken) return children;
  if (token)     return <Navigate to="/" />;
  return <Navigate to="/login" />;
};

const RoleRoute = ({ children, roles, fallback = "/" }) => {
  const user = useAuthStore((s) => s.user);
  if (!roles.includes(user?.role)) return <Navigate to={fallback} />;
  return children;
};

// Ruta index: admin → Dashboard, staff → WelcomePage
const IndexRoute = () => {
  const user = useAuthStore((s) => s.user);
  if (ADMIN_ROLES.includes(user?.role))  return <DashboardPage />;
  if (STAFF_ROLES.includes(user?.role))  return <WelcomePage />;
  return <Navigate to="/rooms" />;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/select-hotel"
          element={
            <TempTokenRoute>
              <SelectHotelPage />
            </TempTokenRoute>
          }
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<IndexRoute />} />

          {/* Rutas accesibles a todos los roles autenticados */}
          <Route path="rooms"        element={<RoomsPage />} />
          <Route path="reservations"       element={<ReservationsPage />} />
          <Route path="reservations/ver"   element={<ViewReservationsPage />} />
          <Route path="reservations/nueva" element={<CreateReservationPage />} />
          <Route path="guests"       element={<GuestsPage />} />
          <Route path="companies"    element={<CompaniesPage />} />
          <Route path="invoices"     element={<InvoicesPage />} />
          <Route path="invoices/new" element={<NewInvoicePage />} />
          <Route path="room-charges" element={<RoomChargedPage />} />
          <Route path="shifts" element={<ShiftsPage />} />
          <Route path="cash-collections" element={<CashCollectionsPage />} />

          {/* Rutas restringidas a ADMIN / SUPERADMIN */}
          <Route
            path="restaurant"
            element={
              <RoleRoute roles={ADMIN_ROLES} fallback="/rooms">
                <RestaurantPage />
              </RoleRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <RoleRoute roles={ADMIN_ROLES} fallback="/rooms">
                <InventoryPage />
              </RoleRoute>
            }
          />
          <Route
            path="users"
            element={
              <RoleRoute roles={ADMIN_ROLES} fallback="/rooms">
                <UsersPage />
              </RoleRoute>
            }
          />
          <Route
            path="reports"
            element={
              <RoleRoute roles={ADMIN_ROLES} fallback="/rooms">
                <SarReportsPage />
              </RoleRoute>
            }
          />

          {/* Solo SUPERADMIN */}
          <Route
            path="hotels"
            element={
              <RoleRoute roles={["SUPERADMIN"]} fallback="/rooms">
                <HotelsPage />
              </RoleRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
