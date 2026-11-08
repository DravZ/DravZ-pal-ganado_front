import { BrowserRouter, Routes, Route } from "react-router-dom";
import SuperLayout from "../layouts/SuperLayout/SuperLayout";
import MainLayout from "../layouts/MainLayout/MainLayout";
import {
  Login,
  NotFound,
  LoginPage,
  ForgotPasswordPage,
  RegisterPage,
  Dashboard,
  AnimalsDirectoryPage,
  RegisterAnimalPage,
  AnimalDetailPage,
  WeightTreatmentPage,
  ReproductionPage,
  MovementsAndSalesPage,
  HealthAndTreatmentsPage,
  HealthEventAndTreatmentPage,
  RegisterVaccinationPage,
  FeedingAndProductionPage,
  InventoryAndPurchasesPage,
  ExpensesAndCostAllocationsPage,
  PaddocksPage,
  OrganizationConfigPage,
  OrganizationInfoPage,
  EditOrganizationInfoPage,
  UsersManagementPage,
  CreateUserPage,
  UserInfoPage,
  EditUserPage,
  FarmsManagementPage,
  FarmInfoPage,
  CreateFarmPage,
  EditFarmPage,
  AlertsPage,
  SyncQueuePage,
  ProfilePage,
  EditProfilePage,
} from "../pages";
import { NotificationProvider } from "../context/NotificationContext";

export default function AppRouter() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SuperLayout />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/hato/animales" element={<AnimalsDirectoryPage />} />
              <Route path="/hato/nuevo" element={<RegisterAnimalPage />} />
              <Route path="/hato/animales/:id" element={<AnimalDetailPage />} />
              <Route path="/hato/pesajes" element={<WeightTreatmentPage />} />
              <Route path="/hato/reproduccion" element={<ReproductionPage />} />
              <Route path="/hato/traslados" element={<MovementsAndSalesPage />} />
              <Route path="/salud/eventos" element={<HealthAndTreatmentsPage />} />
              <Route path="/salud/tratamientos" element={<HealthEventAndTreatmentPage />} />
              <Route path="/salud/vacunacion" element={<RegisterVaccinationPage />} />
              <Route path="/alimentacion/diaria" element={<FeedingAndProductionPage />} />
              <Route path="/alimentacion/inventario" element={<InventoryAndPurchasesPage />} />
              <Route path="/finanzas/gastos" element={<ExpensesAndCostAllocationsPage />} />
              <Route path="/admin/estructura" element={<PaddocksPage />} />
              <Route path="/admin/configuracion" element={<OrganizationConfigPage />} />
              <Route path="/organizacion/informacion" element={<OrganizationInfoPage />} />
              <Route path="/organizacion/editar" element={<EditOrganizationInfoPage />} />
              <Route path="/admin/usuarios" element={<UsersManagementPage />} />
              <Route path="/usuarios/nuevo" element={<CreateUserPage />} />
              <Route path="/usuarios/:id" element={<UserInfoPage />} />
              <Route path="/usuarios/editar/:id" element={<EditUserPage />} />
              <Route path="/admin/fincas" element={<FarmsManagementPage />} />
              <Route path="/fincas/:id" element={<FarmInfoPage />} />
              <Route path="/fincas/nueva" element={<CreateFarmPage />} />
              <Route path="/fincas/editar/:id" element={<EditFarmPage />} />
              <Route path="/admin/alertas" element={<AlertsPage />} />
              <Route path="/admin/sincronizacion" element={<SyncQueuePage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/perfil/editar" element={<EditProfilePage />} />
            </Route>
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}