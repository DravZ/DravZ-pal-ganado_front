import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Beef, LockKeyhole } from "lucide-react";
import type { LoginCredentials } from "../types/database.types";

export default function Login() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const values = new FormData(event.currentTarget);
    const credentials: LoginCredentials = {
      email: String(values.get("email") ?? ""),
      password: String(values.get("password") ?? ""),
    };
    if (!credentials.email || !credentials.password) return;

    // La autenticación se implementará después.
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <Link to="/" className="login-back">
          <ArrowLeft size={17} />
          Volver al inicio
        </Link>

        <Link to="/" className="brand login-brand">
          <span className="brand-icon">
            <Beef size={24} />
          </span>
          <span>Pa'la Vaca</span>
        </Link>

        <div className="login-heading">
          <span className="login-symbol">
            <LockKeyhole size={23} />
          </span>

          <h1>Bienvenido de nuevo</h1>
          <p>Ingresa a tu cuenta para continuar.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="nombre@ejemplo.com"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            autoComplete="current-password"
            required
          />

          <button
            className="button button-primary login-submit"
            type="submit"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="login-footnote">
          Acceso al sistema de gestión ganadera.
        </p>
      </section>
    </main>
  );
}