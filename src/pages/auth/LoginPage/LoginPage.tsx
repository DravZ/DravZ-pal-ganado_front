import React from 'react';
import styles from './LoginPage.module.css';
import { BrandHeroSection } from '../../../components/auth/login/BrandHeroSection/BrandHeroSection';
import { LoginForm } from '../../../components/auth/login/LoginForm/LoginForm';

export const LoginPage: React.FC = () => {
    return (
        <div className={styles.pageLayout}>
            <main className={styles.mainWrapper}>
                <div className="container-fluid p-0">
                    <div className="row g-0 min-vh-100">
                        {/* Vista de Escritorio (Panel Izquierdo Verde) */}
                        <div className="col-lg-5 col-xl-5  d-lg-block d-none">
                            <BrandHeroSection />
                        </div>

                        {/* Formulario Central / Responsivo */}
                        <div className="col-12 col-lg-7 col-xl-7 d-flex flex-column justify-content-center p-3 p-sm-4 p-md-5 mt-0">
                            {/* Logo superior visible exclusivamente en Móvil y Tablet */}
                            <div className={`d-lg-none mb-4 mt-0 ${styles.mobileHeader}`}>
                                <div className={styles.mobileBrandLogo}>
                                    <div className={styles.mobileLogoIcon}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                            <circle cx="12" cy="12" r="4" />
                                        </svg>
                                    </div>
                                    <span>Pa'l Ganado</span>
                                </div>
                            </div>

                            {/* Formulario */}
                            <LoginForm />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;