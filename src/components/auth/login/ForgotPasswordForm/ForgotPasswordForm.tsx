import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ForgotPasswordForm.module.css';
import { KeyRound } from 'lucide-react';

type FormState = 'form' | 'loading' | 'success';

export const ForgotPasswordForm: React.FC = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>('sdfsdf@xdf.c');
    const [formState, setFormState] = useState<FormState>('form');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [serverErrorSimulated, setServerErrorSimulated] = useState<boolean>(false);

    const validateEmail = (): boolean => {
        if (!email.trim()) {
            setErrorMessage('El correo electrónico es requerido.');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrorMessage('Ingresa un correo electrónico válido.');
            return false;
        }
        setErrorMessage('');
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail()) return;

        const payload = {
            email,
            timestamp: new Date().toISOString(),
            action: 'REQUEST_PASSWORD_RESET',
        };

        console.log('[Action Log]: Formulario de recuperación enviado. JSON Payload preparado para Backend:', payload);

        setFormState('loading');

        // Simulación de respuesta de Backend
        setTimeout(() => {
            if (serverErrorSimulated) {
                setErrorMessage('Ocurrió un error en el servidor. Por favor intenta de nuevo.');
                setFormState('form');
                setServerErrorSimulated(false);
            } else {
                setFormState('success');
            }
        }, 2200);
    };

    const handleSimulateServerError = () => {
        console.log('[Action Log]: Simular error de servidor activado');
        setServerErrorSimulated(true);
        if (validateEmail()) {
            setFormState('loading');
            setTimeout(() => {
                setErrorMessage('Error simulado: No se pudo conectar con el servidor.');
                setFormState('form');
                setServerErrorSimulated(false);
            }, 1500);
        }
    };

    const handleBackToLogin = () => {
        console.log('[Router Log]: Navegando a inicio de sesión');
        navigate('/');
    };

    return (
        <div className={styles.formCard}>
            {/* Botón superior Volver al inicio de sesión (Visible en modo formulario) */}
            {formState === 'form' && (
                <button type="button" className={styles.backLinkTop} onClick={handleBackToLogin}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    <span>Volver al inicio de sesión</span>
                </button>
            )}

            {/* 1. ESTADO: FORMULARIO */}
            {formState === 'form' && (
                <div>
                    <div className={`${styles.stateIconWrapper} ${styles.iconDefault}`}>
                        <KeyRound/>
                    </div>

                    <div className={styles.kicker}>RECUPERACIÓN DE ACCESO</div>
                    <h2 className={styles.title}>¿Olvidaste tu contraseña?</h2>
                    <p className={styles.subtitle}>
                        Ingresa el correo electrónico asociado a tu cuenta y te ayudaremos a recuperar el acceso.
                    </p>

                    {errorMessage && (
                        <div className={styles.errorAlertBanner}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="mb-3">
                            <label className={styles.fieldLabel} htmlFor="email">
                                Correo electrónico
                            </label>
                            <div className={styles.inputGroupRelative}>
                                <svg className={styles.mailIconInside} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <input
                                    id="email"
                                    type="email"
                                    className={`${styles.inputControl} ${errorMessage ? styles.inputError : ''}`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@finca.com"
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.primaryButton}>
                            <span>Enviar instrucciones</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>

                        <button type="button" className={styles.secondaryButton} onClick={handleBackToLogin}>
                            Volver al inicio de sesión
                        </button>

                        <button type="button" className={styles.simulateErrorBtn} onClick={handleSimulateServerError}>
                            Simular error del servidor
                        </button>
                    </form>
                </div>
            )}

            {/* 2. ESTADO: PROCESANDO / LOADING */}
            {formState === 'loading' && (
                <div>
                    <div className={`${styles.stateIconWrapper} ${styles.iconLoading}`}>
                        <svg className={styles.spinIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                    </div>

                    <div className={styles.kicker}>PROCESANDO SOLICITUD</div>
                    <h2 className={styles.title}>Estamos verificando tu solicitud</h2>
                    <p className={styles.subtitle}>
                        Espera un momento. No cierres esta ventana ni envíes otra solicitud.
                    </p>

                    <div className={styles.progressTrack}>
                        <div className={styles.progressBarFill}></div>
                    </div>

                    <button type="button" className={styles.loadingButton} disabled>
                        <svg className={styles.spinIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        <span>Enviando instrucciones...</span>
                    </button>
                </div>
            )}

            {/* 3. ESTADO: CONFIRMACIÓN / ÉXITO */}
            {formState === 'success' && (
                <div>
                    <div className={`${styles.stateIconWrapper} ${styles.iconSuccess}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>

                    <div className={styles.kicker}>SOLICITUD CONFIRMADA</div>
                    <h2 className={styles.title}>Revisa tu correo</h2>
                    <p className={styles.subtitle}>
                        Si existe una cuenta asociada a ese correo, recibirás las instrucciones para recuperar el acceso.
                    </p>

                    <div className={styles.infoConfirmCard}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <div>
                            <div className={styles.infoConfirmTextTitle}>Solicitud enviada para</div>
                            <div className={styles.infoConfirmTextEmail}>{email}</div>
                        </div>
                    </div>

                    <button type="button" className={styles.primaryButton} onClick={handleBackToLogin}>
                        Volver al inicio de sesión
                    </button>

                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => {
                            console.log('[Action Log]: Intentar con otro correo');
                            setFormState('form');
                        }}
                    >
                        Intentar con otro correo
                    </button>
                </div>
            )}
        </div>
    );
};