import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../ForgotPasswordForm/ForgotPasswordForm.module.css';
import { KeyRound, Lock } from 'lucide-react';
import { confirmPasswordReset } from '../../../../services/authService';
import { passwordPolicyError } from '../../../../utils/passwordPolicy';

type FormState = 'form' | 'loading' | 'success';

export const ResetPasswordForm: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';

    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [formState, setFormState] = useState<FormState>('form');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleBackToLogin = () => {
        navigate('/');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const policyError = passwordPolicyError(password);
        if (policyError) {
            setErrorMessage(policyError);
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden.');
            return;
        }

        setErrorMessage('');
        setFormState('loading');
        try {
            await confirmPasswordReset(token, password);
            setFormState('success');
        } catch (cause) {
            setErrorMessage(
                cause instanceof Error
                    ? cause.message
                    : 'No se pudo actualizar la contraseña. Intenta de nuevo.'
            );
            setFormState('form');
        }
    };

    // Enlace sin token: no se puede continuar.
    if (!token) {
        return (
            <div className={styles.formCard}>
                <button type="button" className={styles.backLinkTop} onClick={handleBackToLogin}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    <span>Volver al inicio de sesión</span>
                </button>

                <div className={`${styles.stateIconWrapper} ${styles.iconError}`}>
                    <KeyRound />
                </div>

                <div className={styles.kicker}>ENLACE NO VÁLIDO</div>
                <h2 className={styles.title}>No pudimos validar tu enlace</h2>
                <p className={styles.subtitle}>
                    El enlace de recuperación no es válido o ya expiró. Solicita uno nuevo desde la
                    pantalla de recuperación.
                </p>

                <button type="button" className={styles.primaryButton} onClick={() => navigate('/forgot-password')}>
                    Solicitar un nuevo enlace
                </button>
                <button type="button" className={styles.secondaryButton} onClick={handleBackToLogin}>
                    Volver al inicio de sesión
                </button>
            </div>
        );
    }

    return (
        <div className={styles.formCard}>
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
                        <KeyRound />
                    </div>

                    <div className={styles.kicker}>NUEVA CONTRASEÑA</div>
                    <h2 className={styles.title}>Restablece tu contraseña</h2>
                    <p className={styles.subtitle}>
                        Crea una contraseña nueva para tu cuenta. Debe incluir mayúscula, minúscula,
                        número y un carácter especial, sin espacios.
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
                            <label className={styles.fieldLabel} htmlFor="new-password">
                                Nueva contraseña
                            </label>
                            <div className={styles.inputGroupRelative}>
                                <Lock className={styles.mailIconInside} size={18} />
                                <input
                                    id="new-password"
                                    type="password"
                                    className={`${styles.inputControl} ${errorMessage ? styles.inputError : ''}`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className={styles.fieldLabel} htmlFor="confirm-password">
                                Confirmar contraseña
                            </label>
                            <div className={styles.inputGroupRelative}>
                                <Lock className={styles.mailIconInside} size={18} />
                                <input
                                    id="confirm-password"
                                    type="password"
                                    className={`${styles.inputControl} ${errorMessage ? styles.inputError : ''}`}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.primaryButton}>
                            <span>Guardar contraseña</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* 2. ESTADO: PROCESANDO */}
            {formState === 'loading' && (
                <div>
                    <div className={`${styles.stateIconWrapper} ${styles.iconLoading}`}>
                        <svg className={styles.spinIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                    </div>

                    <div className={styles.kicker}>GUARDANDO CAMBIOS</div>
                    <h2 className={styles.title}>Estamos actualizando tu contraseña</h2>
                    <p className={styles.subtitle}>
                        Espera un momento. No cierres esta ventana.
                    </p>

                    <div className={styles.progressTrack}>
                        <div className={styles.progressBarFill}></div>
                    </div>

                    <button type="button" className={styles.loadingButton} disabled>
                        <svg className={styles.spinIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        <span>Guardando contraseña...</span>
                    </button>
                </div>
            )}

            {/* 3. ESTADO: ÉXITO */}
            {formState === 'success' && (
                <div>
                    <div className={`${styles.stateIconWrapper} ${styles.iconSuccess}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>

                    <div className={styles.kicker}>CONTRASEÑA ACTUALIZADA</div>
                    <h2 className={styles.title}>Listo, ya puedes iniciar sesión</h2>
                    <p className={styles.subtitle}>
                        Tu contraseña se actualizó correctamente. Usa tus nuevas credenciales para
                        entrar al sistema.
                    </p>

                    <button type="button" className={styles.primaryButton} onClick={handleBackToLogin}>
                        Ir al inicio de sesión
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResetPasswordForm;
