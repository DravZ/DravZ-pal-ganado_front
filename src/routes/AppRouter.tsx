import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import SuperLayout from "../layouts/SuperLayout/SuperLayout";
import LoginPage from "../pages/auth/LoginPage/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage/ForgotPasswordPage";
import RegisterPage from "../pages/auth/RegisterPage/RegisterPage";
import MainLayout from "../layouts/MainLayout/MainLayout";
import Dashboard from "../pages/dashboard/DashboardPage";
import AnimalsDirectoryPage from "../pages/AnimalsDirectory/AnimalsDirectoryPage";
import RegisterAnimalPage from "../pages/RegisterAnimalPage/RegisterAnimalPage";
import AnimalDetailPage from "../pages/AnimalDetailPage/AnimalDetailPage";
import WeightTreatmentPage from "../pages/WeightTreatmentPage/WeightTreatmentPage";

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
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}