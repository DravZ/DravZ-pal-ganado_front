import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { FarmConfigModal } from '../FarmConfigModal/FarmConfigModal';
import styles from './RegisterForm.module.css';
import useNotification from '../../../../hooks/useNotification';
import { registerAccount } from '../../../../services/authService';
import { passwordPolicyError } from '../../../../utils/passwordPolicy';
import type {
  FarmFormValues,
  RegistrationFormValues,
} from '../../../../types/database.types';

type FormErrors = Partial<Record<keyof RegistrationFormValues, string>>;

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Estado del modal de configuración de finca
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del formulario principal
  const [formData, setFormData] = useState<RegistrationFormValues>({
    userName: '',
    userPhone: '',
    userEmail: '',
    userPass: '',
    orgName: '',
    orgLegalName: '',
    orgTaxId: '',
    orgPhone: '',
    orgEmail: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Manejador centralizado de inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegistrationFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Función de validación Clean Code
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s().-]{7,30}$/;

    // 1. Datos de usuario
    if (!formData.userName.trim()) {
      newErrors.userName = 'El nombre es obligatorio.';
    } else if (formData.userName.trim().length > 150) {
      newErrors.userName = 'El nombre no puede superar 150 caracteres.';
    }
    if (!formData.userPhone.trim()) {
      newErrors.userPhone = 'El teléfono es obligatorio.';
    } else if (!phoneRegex.test(formData.userPhone.trim())) {
      newErrors.userPhone = 'Introduce un teléfono válido (7 a 30 caracteres).';
    }

    if (!formData.userEmail.trim()) {
      newErrors.userEmail = 'El correo electrónico es obligatorio.';
    } else if (formData.userEmail.trim().length > 150 || !emailRegex.test(formData.userEmail.trim())) {
      newErrors.userEmail = 'Formato de correo no válido.';
    }

    if (!formData.userPass) {
      newErrors.userPass = 'La contraseña es obligatoria.';
    } else {
      const passwordError = passwordPolicyError(formData.userPass);
      if (passwordError) newErrors.userPass = passwordError;
    }

    // 2. Datos de organización
    if (!formData.orgName.trim()) {
      newErrors.orgName = 'El nombre comercial es obligatorio.';
    } else if (formData.orgName.trim().length > 150) {
      newErrors.orgName = 'El nombre comercial no puede superar 150 caracteres.';
    }
    if (!formData.orgLegalName.trim()) {
      newErrors.orgLegalName = 'La razón social es obligatoria.';
    } else if (formData.orgLegalName.trim().length > 200) {
      newErrors.orgLegalName = 'La razón social no puede superar 200 caracteres.';
    }
    if (!formData.orgTaxId.trim()) {
      newErrors.orgTaxId = 'El NIT / RUT es obligatorio.';
    } else if (formData.orgTaxId.trim().length > 30) {
      newErrors.orgTaxId = 'El NIT / RUT no puede superar 30 caracteres.';
    }
    if (!formData.orgPhone.trim()) {
      newErrors.orgPhone = 'El teléfono de la organización es obligatorio.';
    } else if (!phoneRegex.test(formData.orgPhone.trim())) {
      newErrors.orgPhone = 'Introduce un teléfono válido (7 a 30 caracteres).';
    }

    if (!formData.orgEmail.trim()) {
      newErrors.orgEmail = 'El correo de la organización es obligatorio.';
    } else if (formData.orgEmail.trim().length > 150 || !emailRegex.test(formData.orgEmail.trim())) {
      newErrors.orgEmail = 'Formato de correo no válido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 1. Paso 1: Valida el formulario de registro y abre el modal
  const handleOpenFarmModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsModalOpen(true);
    }
  };

  // 2. Paso 2: Finalización desde el modal, imprime todo el payload unificado y redirige a '/'
  const handleFinalSubmit = async (farmData: FarmFormValues) => {
    if (!navigator.onLine) {
      showNotification({
        type: 'error',
        title: 'Sin conexión',
        message: 'Conéctate a internet para crear tu cuenta e inténtalo de nuevo.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await registerAccount(formData, farmData);
      setIsModalOpen(false);
      showNotification({
        type: 'success',
        title: 'Registro completado',
        message: 'Tu cuenta se creó correctamente. Ya puedes iniciar sesión.',
      });
      navigate('/');
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'No se pudo completar el registro',
        message: error instanceof Error
          ? error instanceof TypeError
            ? 'No fue posible conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
            : error.message
          : 'Ocurrió un error inesperado. Inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formCard}>
      {/* Botón superior de retorno */}
      <button
        type="button"
        className={styles.backLinkTop}
        onClick={() => {
          navigate('/');
        }}
      >
        <ArrowLeft size={18} strokeWidth={2.5} />
        <span>Volver al inicio de sesión</span>
      </button>

      <div className={styles.kicker}>NUEVA CUENTA</div>
      <h2 className={styles.title}>Crea tu espacio de trabajo</h2>
      <p className={styles.subtitle}>
        Primero cuéntanos quién eres y cómo se llama tu organización.
      </p>

      <form onSubmit={handleOpenFarmModal} noValidate>
        {/* SECCIÓN 1: Datos del Usuario */}
        <div className={styles.sectionHeader}>
          <div className={styles.stepBadge}>1</div>
          <div>
            <h3 className={styles.sectionTitle}>Datos del usuario</h3>
            <p className={styles.sectionSubtext}>Tu información de acceso</p>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className={styles.fieldLabel} htmlFor="userName">
              Nombre completo (users.name)
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              className={`${styles.inputControl} ${errors.userName ? styles.inputError : ''}`}
              placeholder="Ej. Rafael Mendes"
              value={formData.userName}
              onChange={handleChange}
              maxLength={150}
              required
            />
            {errors.userName && <div className={styles.errorMessage}>{errors.userName}</div>}
          </div>

          <div className="col-12 col-md-6">
            <label className={styles.fieldLabel} htmlFor="userPhone">
              Teléfono (users.phone)
            </label>
            <input
              id="userPhone"
              name="userPhone"
              type="tel"
              className={`${styles.inputControl} ${errors.userPhone ? styles.inputError : ''}`}
              placeholder="+57 300 000 0000"
              value={formData.userPhone}
              onChange={handleChange}
              maxLength={30}
              required
            />
            {errors.userPhone && <div className={styles.errorMessage}>{errors.userPhone}</div>}
          </div>

          <div className="col-12 col-md-6">
            <label className={styles.fieldLabel} htmlFor="userEmail">
              Correo electrónico (users.email)
            </label>
            <input
              id="userEmail"
              name="userEmail"
              type="email"
              className={`${styles.inputControl} ${errors.userEmail ? styles.inputError : ''}`}
              placeholder="nombre@correo.com"
              value={formData.userEmail}
              onChange={handleChange}
              maxLength={150}
              autoComplete="email"
              required
            />
            {errors.userEmail && <div className={styles.errorMessage}>{errors.userEmail}</div>}
          </div>

          <div className="col-12 col-md-6">
            <label className={styles.fieldLabel} htmlFor="userPass">
              Contraseña
            </label>
            <input
              id="userPass"
              name="userPass"
              type="password"
              className={`${styles.inputControl} ${errors.userPass ? styles.inputError : ''}`}
              placeholder="Más de 8 caracteres"
              value={formData.userPass}
              onChange={handleChange}
              minLength={9}
              maxLength={72}
              autoComplete="new-password"
              required
            />
            {errors.userPass && <div className={styles.errorMessage}>{errors.userPass}</div>}
            <div className={styles.termsText}>
              Usa más de 8 caracteres, con mayúscula, minúscula, número y símbolo, sin espacios.
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* SECCIÓN 2: Organización */}
        <div className={styles.sectionHeader}>
          <div className={styles.stepBadge}>2</div>
          <div>
            <h3 className={styles.sectionTitle}>Organización</h3>
            <p className={styles.sectionSubtext}>Información fiscal y comercial</p>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className={styles.fieldLabel} htmlFor="orgName">
              Nombre comercial (organizations.name)
            </label>
            <input
              id="orgName"
              name="orgName"
              type="text"
              className={`${styles.inputControl} ${errors.orgName ? styles.inputError : ''}`}
              placeholder="Ej. Ganadería La Esperanza"
              value={formData.orgName}
              onChange={handleChange}
              maxLength={150}
              required
            />
            {errors.orgName && <div className={styles.errorMessage}>{errors.orgName}</div>}
          </div>

          <div className="col-12 col-md-6">
            <label className={styles.fieldLabel} htmlFor="orgLegalName">
              Razón social (organizations.legal_name)
            </label>
            <input
              id="orgLegalName"
              name="orgLegalName"
              type="text"
              className={`${styles.inputControl} ${errors.orgLegalName ? styles.inputError : ''}`}
              placeholder="Nombre legal registrado"
              value={formData.orgLegalName}
              onChange={handleChange}
              maxLength={200}
              required
            />
            {errors.orgLegalName && <div className={styles.errorMessage}>{errors.orgLegalName}</div>}
          </div>

          <div className="col-12 col-md-6">
            <label className={styles.fieldLabel} htmlFor="orgTaxId">
              NIT / RUT (organizations.tax_id)
            </label>
            <input
              id="orgTaxId"
              name="orgTaxId"
              type="text"
              className={`${styles.inputControl} ${errors.orgTaxId ? styles.inputError : ''}`}
              placeholder="900.000.000-1"
              value={formData.orgTaxId}
              onChange={handleChange}
              maxLength={30}
              required
            />
            {errors.orgTaxId && <div className={styles.errorMessage}>{errors.orgTaxId}</div>}
          </div>

          <div className="col-12 col-md-6">
            <label className={styles.fieldLabel} htmlFor="orgPhone">
              Teléfono (organizations.phone)
            </label>
            <input
              id="orgPhone"
              name="orgPhone"
              type="tel"
              className={`${styles.inputControl} ${errors.orgPhone ? styles.inputError : ''}`}
              placeholder="+57 601 000 0000"
              value={formData.orgPhone}
              onChange={handleChange}
              maxLength={30}
              required
            />
            {errors.orgPhone && <div className={styles.errorMessage}>{errors.orgPhone}</div>}
          </div>

          <div className="col-12">
            <label className={styles.fieldLabel} htmlFor="orgEmail">
              Correo de la organización
            </label>
            <input
              id="orgEmail"
              name="orgEmail"
              type="email"
              className={`${styles.inputControl} ${errors.orgEmail ? styles.inputError : ''}`}
              placeholder="administracion@empresa.com"
              value={formData.orgEmail}
              onChange={handleChange}
              maxLength={150}
              autoComplete="organization"
              required
            />
            {errors.orgEmail && <div className={styles.errorMessage}>{errors.orgEmail}</div>}
          </div>
        </div>

        {/* Botón Submit que abre el Modal */}
        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          <span>Continuar: configurar finca</span>
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>

        <p className={styles.termsText}>
          Al continuar aceptas nuestros Términos de servicio y Política de privacidad.
        </p>
      </form>

      {/* Modal Modular de Configuración de Finca */}
      <FarmConfigModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSubmitting) setIsModalOpen(false);
        }}
        onSubmitFarm={handleFinalSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};