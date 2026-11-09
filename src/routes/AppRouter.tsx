import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SuperLayout from "../layouts/SuperLayout/SuperLayout";
import MainLayout from "../layouts/MainLayout/MainLayout";
import AuthGuard from "../components/shared/AuthGuard/AuthGuard";
import { AuthProvider } from "../context/AuthContext";
import { NotificationProvider } from "../context/NotificationContext";

const NotFound = lazy(() => import("../pages/NotFound"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage/LoginPage"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage/ForgotPasswordPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage/RegisterPage"));
const Dashboard = lazy(() => import("../pages/dashboard/DashboardPage"));
const AnimalsDirectoryPage = lazy(() => import("../pages/HatoModule/AnimalsDirectory/AnimalsDirectoryPage"));
const RegisterAnimalPage = lazy(() => import("../pages/HatoModule/RegisterAnimalPage/RegisterAnimalPage"));
const AnimalDetailPage = lazy(() => import("../pages/HatoModule/AnimalDetailPage/AnimalDetailPage"));
const EditAnimalPage = lazy(() => import("../pages/HatoModule/EditAnimalPage/EditAnimalPage"));
const WeightTreatmentPage = lazy(() => import("../pages/HatoModule/WeightTreatmentPage/WeightTreatmentPage"));
const ReproductionPage = lazy(() => import("../pages/HatoModule/ReproductionPage/ReproductionPage"));
const MovementsAndSalesPage = lazy(() => import("../pages/HatoModule/MovementsAndSalesPage/MovementsAndSalesPage"));
const HealthAndTreatmentsPage = lazy(() => import("../pages/HealthModule/HealthAndTreatmentsPage/HealthAndTreatmentsPage"));
const HealthEventAndTreatmentPage = lazy(() => import("../pages/HealthModule/HealthEventAndTreatmentPage/HealthEventAndTreatmentPage"));
const RegisterVaccinationPage = lazy(() => import("../pages/HealthModule/RegisterVaccinationPage/RegisterVaccinationPage"));
const FeedingAndProductionPage = lazy(() => import("../pages/FoodSuppliesModule/FeedingAndProductionPage/FeedingAndProductionPage"));
const InventoryAndPurchasesPage = lazy(() => import("../pages/FoodSuppliesModule/InventoryAndPurchasesPage/InventoryAndPurchasesPage"));
const ExpensesAndCostAllocationsPage = lazy(() => import("../pages/FinancesModule/ExpensesAndCostAllocationsPage/ExpensesAndCostAllocationsPage"));
const PaddocksPage = lazy(() => import("../pages/AdministrationModule/PaddocksPage/PaddocksPage"));
const OrganizationConfigPage = lazy(() => import("../pages/AdministrationModule/OrganizationConfigPage/OrganizationConfigPage"));
const OrganizationInfoPage = lazy(() => import("../pages/AdministrationModule/OrganizationInfoPage/OrganizationInfoPage"));
const EditOrganizationInfoPage = lazy(() => import("../pages/AdministrationModule/EditOrganizationInfoPage/EditOrganizationInfoPage"));
const UsersManagementPage = lazy(() => import("../pages/AdministrationModule/UsersManagementPage/UsersManagementPage"));
const CreateUserPage = lazy(() => import("../pages/AdministrationModule/CreateUserPage/CreateUserPage"));
const UserInfoPage = lazy(() => import("../pages/AdministrationModule/UserInfoPage/UserInfoPage"));
const EditUserPage = lazy(() => import("../pages/AdministrationModule/EditUserPage/EditUserPage"));
const FarmsManagementPage = lazy(() => import("../pages/AdministrationModule/FarmsManagementPage/FarmsManagementPage"));
const FarmInfoPage = lazy(() => import("../pages/AdministrationModule/FarmInfoPage/FarmInfoPage"));
const CreateFarmPage = lazy(() => import("../pages/AdministrationModule/CreateFarmPage/CreateFarmPage"));
const EditFarmPage = lazy(() => import("../pages/AdministrationModule/EditFarmPage/EditFarmPage"));
const AlertsPage = lazy(() => import("../pages/AdministrationModule/AlertsPage/AlertsPage"));
const SyncQueuePage = lazy(() => import("../pages/AdministrationModule/SyncQueuePage/SyncQueuePage"));
const ProfilePage = lazy(() => import("../pages/ProfileModule/ProfilePage/ProfilePage"));
const EditProfilePage = lazy(() => import("../pages/ProfileModule/EditProfilePage/EditProfilePage"));

export default function AppRouter() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div role="status" aria-live="polite">Cargando pantalla…</div>}>
            <Routes>
              <Route element={<SuperLayout />}>
                <Route path="/" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route element={<AuthGuard />}>
                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/hato/animales" element={<AnimalsDirectoryPage />} />
                    <Route path="/hato/nuevo" element={<RegisterAnimalPage />} />
                    <Route path="/hato/animales/:id/editar" element={<EditAnimalPage />} />
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
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </NotificationProvider>
  );
}
