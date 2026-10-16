import React from 'react';
import { ShieldCheck } from 'lucide-react';
import styles from './RegisterPage.module.css';
import { BrandHeroSection } from '../../../components/auth/login/BrandHeroSection/BrandHeroSection';
import { RegisterForm } from '../../../components/auth/register/RegisterForm/RegisterForm';

// Componente Wrapper de la Página de Registro
export const RegisterPage: React.FC = () => {
    return (
        <div className={styles.pageLayout}>
            <main className={styles.mainWrapper}>
                <div className="container-fluid p-0">
                    <div className="row g-0 min-vh-100">
                        {/* Panel Lateral Ilustrativo en Escritorio */}
                        <div className="col-12 col-lg-5 col-xl-5 d-none d-lg-block">
                            <BrandHeroSection />
                        </div>

                        {/* Formulario Principal de Registro Responsivo */}
                        <div className="col-12 col-lg-7 col-xl-7 d-flex flex-column justify-content-center p-3 p-sm-4 p-md-5">
                            {/* Logo Visible Únicamente en Pantallas Móviles/Tablets */}
                            <div className={`d-lg-none ${styles.mobileHeader}`}>
                                <div className={styles.mobileBrandLogo}>
                                    <div className={styles.mobileLogoIcon}>
                                        <ShieldCheck size={22} strokeWidth={2.2} />
                                    </div>
                                    <span>Pa'l Ganado</span>
                                </div>
                            </div>

                            {/* Componente Modular de Formulario */}
                            <RegisterForm />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;