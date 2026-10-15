import { Link } from "react-router-dom";
import {
  ArrowRight,
  Beef,
  ClipboardList,
  Cloud,
  Sprout,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Beef,
    title: "Control del ganado",
    description:
      "Mantén organizada la información de tus animales, sus características y su historial.",
  },
  {
    icon: ClipboardList,
    title: "Gestión simplificada",
    description:
      "Consulta y administra los registros importantes de tu operación ganadera.",
  },
  {
    icon: TrendingUp,
    title: "Mejores decisiones",
    description:
      "Organiza la información de tu rancho para dar seguimiento a su desempeño.",
  },
  {
    icon: Cloud,
    title: "Pensado para el campo",
    description:
      "Una plataforma preparada para evolucionar hacia el trabajo con y sin conexión.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">
              <Sprout size={16} />
              Tecnología para el campo
            </span>

            <h1>
              Gestiona tu ganado con{" "}
              <span>claridad y confianza.</span>
            </h1>

            <p className="hero-description">
              Pal Ganado te ayudará a organizar la información de tu unidad
              ganadera y mantener el control de las actividades de tu rancho
              desde un solo lugar.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="button button-primary">
                Acceder al sistema <ArrowRight size={18} />
              </Link>

              <Link to="/about" className="button button-secondary">
                Conocer más
              </Link>
            </div>

            <div className="hero-note">
              <span className="status-dot" />
              Diseñado para las necesidades del sector ganadero
            </div>
          </div>

          <div className="hero-image-wrapper">
            
            <div className="hero-image-overlay" />

            <div className="hero-floating-card">
              <span className="floating-icon">
                <Beef size={22} />
              </span>
              <div>
                <strong>Tu rancho, organizado</strong>
                <p>La información que necesitas, en un solo lugar.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Una gestión más sencilla</span>
            <h2>Todo comienza con una mejor organización</h2>
            <p>
              Herramientas diseñadas para ayudarte a administrar la información
              de tu operación ganadera.
            </p>
          </div>

          <div className="features-grid">
            {features.map(({ icon: Icon, title, description }) => (
              <article className="feature-card" key={title}>
                <div className="feature-icon">
                  <Icon size={24} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-content">
          <div>
            <span className="eyebrow">Pal Ganado</span>
            <h2>Tu trabajo en el campo merece mejores herramientas.</h2>
            <p>
              Ingresa a la plataforma y descubre una forma más organizada de
              gestionar tu operación.
            </p>
          </div>

          <Link to="/login" className="button button-light">
            Iniciar sesión <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}