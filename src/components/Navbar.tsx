import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Beef } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const closeMenu = (): void => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-icon">
            <Beef size={23} />
          </span>
          <span>Pal Ganado</span>
        </Link>

        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={`nav-links ${menuOpen ? "is-open" : ""}`}>
          <NavLink to="/" end onClick={closeMenu}>
            Inicio
          </NavLink>
          <NavLink to="/about" onClick={closeMenu}>
            Nosotros
          </NavLink>
          <Link to="/login" className="nav-login" onClick={closeMenu}>
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}