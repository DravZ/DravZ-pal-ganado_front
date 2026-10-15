import { Link } from "react-router-dom";
import { ArrowLeft, House } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <span className="not-found-code">404</span>
        <div className="not-found-icon">
          <House size={28} />
        </div>
        <h1>Página no encontrada</h1>
        <p>
          La página que buscas no existe o pudo haber cambiado de dirección.
        </p>
        <Link to="/" className="button button-primary">
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}