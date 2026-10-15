import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './LoginForm.module.css';

interface FormErrors {
    email?: string;
    password?: string;
}

export const LoginForm: React.FC = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>('rafael@serraverde.com');
    const [password, setPassword] = useState<string>('12345678');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [rememberMe, setRememberMe] = useState<boolean>(true);
    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!email.trim()) {
            newErrors.email = 'El correo electrónico es requerido.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Introduce un correo electrónico válido.';
        }

        if (!password) {
            newErrors.password = 'La contraseña es requerida.';
        } else if (password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('[Action Log]: Submit Login', {
                email,
                password: '***',
                rememberMe,
            });
            // Redirección directa al dashboard tras autenticación exitosa
            navigate('/dashboard');
        }
    };

    const handleNavigation = (path: string, label: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        console.log(`[Router Log]: Navegando hacia "${path}" (${label})`);
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
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@finca.com"
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
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className={styles.togglePassBtn}
                            onClick={() => {
                                console.log('[Action Log]: Toggle Visibilidad Contraseña');
                                setShowPassword(!showPassword);
                            }}
                        >
                            {showPassword ? 'Ocultar' : 'Mostrar'}
                        </button>
                    </div>
                    {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
                </div>

                {/* Remember me & Forgot Password */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <label className="d-flex align-items-center gap-2 m-0" style={{ cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={rememberMe}
                            onChange={(e) => {
                                console.log('[Action Log]: Checkbox Recordarme =', e.target.checked);
                                setRememberMe(e.target.checked);
                            }}
                        />
                        <span style={{ fontSize: '0.825rem', color: '#0F172A', fontWeight: 500 }}>
                            Recordarme
                        </span>
                    </label>

                    <Link
                        to="/forgot-password"
                        className={styles.forgotLink}
                        onClick={handleNavigation('/forgot-password', 'Recuperar Contraseña')}
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                {/* Main Action Button */}
                <button type="submit" className={styles.primaryButton}>
                    <span>Ingresar a Pa'l Ganado</span>
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
                        onClick={handleNavigation('/register', 'Crear Cuenta')}
                    >
                        Crear cuenta
                    </Link>
                </div>
            </form>
        </div>
    );
};