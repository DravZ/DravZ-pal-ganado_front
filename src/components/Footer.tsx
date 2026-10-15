import { Link } from "react-router-dom";
import { Beef, Heart, Sprout } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <span className="brand-icon">
              <Beef size={23} />
            </span>
            <span>Pal Ganado</span>
          </Link>

          <p>
            Tecnología y organización para acompañar el trabajo de quienes
            producen en el campo.
          </p>
        </div>

        <div className="footer-links">
          <h3>Explora</h3>
          <Link to="/">Inicio</Link>
          <Link to="/about">Nosotros</Link>
          <Link to="/login">Iniciar sesión</Link>
        </div>

        <div className="footer-purpose">
          <span className="footer-purpose-icon">
            <Sprout size={21} />
          </span>
          <p>Una herramienta pensada para el campo.</p>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>
          © {new Date().getFullYear()} Pal Ganado. Todos los derechos
          reservados.
        </p>
        <span>
          Hecho con <Heart size={14} /> para el campo
        </span>
      </div>
    </footer>
  );
}