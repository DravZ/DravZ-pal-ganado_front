import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './LoginForm.module.css';
import { useAuth } from '../../../../context/AuthContext';
import useNotification from '../../../../hooks/useNotification';

interface FormErrors {
    email?: string;
    password?: string;
}

export const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showNotification } = useNotification();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!email.trim()) {
            newErrors.email = 'El correo electrónico es requerido.';
        } else if (email.trim().length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            newErrors.email = 'Introduce un correo electrónico válido.';
        }

        if (!password) {
            newErrors.password = 'La contraseña es requerida.';
        } else if (password.length < 8 || password.length > 100) {
            newErrors.password = 'La contraseña debe tener entre 8 y 100 caracteres.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!navigator.onLine) {
            showNotification({
                type: 'error',
                title: 'Se requiere conexión',
                message: 'El inicio de sesión necesita conexión a internet.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'No se pudo iniciar sesión',
                message: error instanceof TypeError
                    ? 'No fue posible conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
                    : error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNavigation = (path: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(path);
    };

    return (
        <div className={styles.formCard}>
            <div className={styles.kicker}>BIENVENIDO DE NUEVO</div>
            <h2 className={styles.title}>Ingresa a tu cuenta</h2>
            <p className={styles.subtitle}>Continúa administrando tu finca y tu ganado.</p>

            <form onSubmit={handleSubmit} noValidate>
                {/* Email Field */}
                <div className="mb-3">
                    <label className={styles.fieldLabel} htmlFor="email">
                        Correo electrónico
                    </label>
                    <input
                        id="email"
                        type="email"
                        className={`${styles.inputControl} ${errors.email ? styles.inputError : ''}`}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors((previous) => ({ ...previous, email: undefined }));
                        }}
                        placeholder="ejemplo@finca.com"
                        autoComplete="email"
                        maxLength={150}
                        required
                    />
                    {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
                </div>

                {/* Password Field */}
                <div className="mb-3">
                    <label className={styles.fieldLabel} htmlFor="password">
                        Contraseña
                    </label>
                    <div className={styles.passwordWrapper}>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className={`${styles.inputControl} ${errors.password ? styles.inputError : ''}`}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors((previous) => ({ ...previous, password: undefined }));
                            }}
                            autoComplete="current-password"
                            maxLength={100}
                            required
                        />
                        <button
                            type="button"
                            className={styles.togglePassBtn}
                            onClick={() => {
                                setShowPassword(!showPassword);
                            }}
                        >
                            {showPassword ? 'Ocultar' : 'Mostrar'}
                        </button>
                    </div>
                    {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
                </div>

                {/* Forgot Password */}
                <div className="d-flex align-items-center justify-content-end mb-4">
                    <Link
                        to="/forgot-password"
                        className={styles.forgotLink}
                        onClick={handleNavigation('/forgot-password')}
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                {/* Main Action Button */}
                <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
                    <span>{isSubmitting ? 'Conectando...' : "Ingresar a Pa'la Vaca"}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>

                {/* Register Footer Link */}
                <div className={styles.footerRegister}>
                    ¿Aún no tienes una cuenta?{' '}
                    <Link
                        to="/register"
                        className={styles.registerLink}
                        onClick={handleNavigation('/register')}
                    >
                        Crear cuenta
                    </Link>
                </div>
            </form>
        </div>
    );
};