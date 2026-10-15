import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Leaf,
  ShieldCheck,
  Users,
} from "lucide-react";

const values = [
  {
    icon: Compass,
    title: "Claridad",
    description:
      "Organizar la información para facilitar las tareas y la toma de decisiones.",
  },
  {
    icon: ShieldCheck,
    title: "Confiabilidad",
    description:
      "Construir una herramienta enfocada en el manejo ordenado de los registros ganaderos.",
  },
  {
    icon: Leaf,
    title: "Enfoque práctico",
    description:
      "Desarrollar funciones útiles para las necesidades cotidianas del campo.",
  },
  {
    icon: Users,
    title: "Crecimiento",
    description:
      "Crear una plataforma que pueda ampliarse conforme evolucionen las necesidades de cada unidad ganadera.",
  },
];

export default function About() {
  return (
    <main>
      <section className="about-hero">
        <div className="container about-hero-content">
          <span className="eyebrow">Conoce nuestra propuesta</span>
          <h1>
            Una gestión ganadera más <span>organizada.</span>
          </h1>
          <p>
            Pal Ganado nace con el propósito de facilitar la administración de
            la información ganadera mediante una plataforma clara, práctica y
            preparada para crecer.
          </p>
          <Link to="/login" className="button button-primary">
            Conocer la plataforma <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="about-mission-section">
        <div className="container about-mission-grid">
          <div className="about-mission-image">
            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85"
              alt="Campo verde y paisaje rural"
              loading="lazy"
            />
          </div>

          <div className="about-mission-content">
            <span className="eyebrow">Nuestro propósito</span>
            <h2>La información correcta puede hacer la diferencia.</h2>
            <p>
              La actividad ganadera requiere dar seguimiento a animales,
              registros y actividades que forman parte del trabajo diario.
              Cuando esa información se encuentra dispersa, consultarla y
              mantenerla actualizada puede ser complicado.
            </p>
            <p>
              Pal Ganado busca centralizar esa información en una experiencia
              sencilla, con una estructura que permita incorporar nuevas
              herramientas conforme el sistema evolucione.
            </p>

            <ul className="about-check-list">
              <li>
                <CheckCircle2 size={19} />
                Información organizada por módulos
              </li>
              <li>
                <CheckCircle2 size={19} />
                Interfaz clara y adaptable a distintos dispositivos
              </li>
              <li>
                <CheckCircle2 size={19} />
                Preparación para futuras funciones de trabajo sin conexión
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Lo que nos guía</span>
            <h2>Principios de diseño</h2>
            <p>
              Una base pensada para construir una herramienta útil, flexible y
              centrada en el trabajo ganadero.
            </p>
          </div>

          <div className="values-grid">
            {values.map(({ icon: Icon, title, description }) => (
              <article className="value-card" key={title}>
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

      <section className="about-cta">
        <div className="container about-cta-inner">
          <div>
            <h2>Construyamos una mejor forma de gestionar tu rancho.</h2>
            <p>Accede a Pal Ganado para continuar.</p>
          </div>
          <Link to="/login" className="button button-primary">
            Iniciar sesión <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}