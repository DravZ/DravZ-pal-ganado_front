import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import SuperLayout from "../layouts/SuperLayout/SuperLayout";
import LoginPage from "../pages/auth/LoginPage/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage/ForgotPasswordPage";
import RegisterPage from "../pages/auth/RegisterPage/RegisterPage";
import MainLayout from "../layouts/MainLayout/MainLayout";
import Dashboard from "../pages/dashboard/DashboardPage";
import AnimalsDirectoryPage from "../pages/HatoModule/AnimalsDirectory/AnimalsDirectoryPage";
import RegisterAnimalPage from "../pages/HatoModule/RegisterAnimalPage/RegisterAnimalPage";
import AnimalDetailPage from "../pages/HatoModule/AnimalDetailPage/AnimalDetailPage";
import WeightTreatmentPage from "../pages/HatoModule/WeightTreatmentPage/WeightTreatmentPage";
import ReproductionPage from "../pages/HatoModule/ReproductionPage/ReproductionPage";
import HealthAndTreatmentsPage from "../pages/HealthModule/HealthAndTreatmentsPage/HealthAndTreatmentsPage";
import MovementsAndSalesPage from "../pages/HatoModule/MovementsAndSalesPage/MovementsAndSalesPage";
import HealthEventAndTreatmentPage from "../pages/HealthModule/HealthEventAndTreatmentPage/HealthEventAndTreatmentPage";
import RegisterVaccinationPage from "../pages/HealthModule/RegisterVaccinationPage/RegisterVaccinationPage";
import FeedingAndProductionPage from "../pages/FoodSuppliesModule/FeedingAndProductionPage/FeedingAndProductionPage";
import InventoryAndPurchasesPage from "../pages/FoodSuppliesModule/InventoryAndPurchasesPage/InventoryAndPurchasesPage";
import ExpensesAndCostAllocationsPage from "../pages/FinancesModule/ExpensesAndCostAllocationsPage/ExpensesAndCostAllocationsPage";
import PaddocksPage from "../pages/AdministrationModule/PaddocksPage/PaddocksPage";
import OrganizationConfigPage from "../pages/AdministrationModule/OrganizationConfigPage/OrganizationConfigPage";
import OrganizationInfoPage from "../pages/AdministrationModule/OrganizationInfoPage/OrganizationInfoPage";

export default function AppRouter() {
  return (
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
            <>
              <Route path="/salud/eventos" element={<HealthAndTreatmentsPage />} />
              <Route path="/salud/tratamientos" element={<HealthEventAndTreatmentPage />} />
              <Route path="/salud/vacunacion" element={<RegisterVaccinationPage />} />
            </>
            <>
              <Route path="/alimentacion/diaria" element={<FeedingAndProductionPage />} />
              <Route path="/alimentacion/inventario" element={<InventoryAndPurchasesPage />} />
            </>
            <>
              <Route path="/finanzas/gastos" element={<ExpensesAndCostAllocationsPage />} />
            </>
            <>
              <Route path="/admin/estructura" element={<PaddocksPage />} />
              <Route path="/admin/configuracion" element={<OrganizationConfigPage />} />
              <Route path="/organizacion/informacion" element={<OrganizationInfoPage />} />
            </>
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}