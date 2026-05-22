import { useContext } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'

const RUTA_POR_ROL = {
  'diseñador':     '/dashboard/disenador',
  'instructor':    '/dashboard/instructor',
  'administrador': '/dashboard/admin',
}

function LandingNav() {
  return (
    <nav className="lnav">
      <div className="lnav__inner">
        <Link to="/" className="lnav__brand">
          <span className="lnav__logo-mark">C</span>
          CODICH
        </Link>
        <ul className="lnav__links">
          <li><a href="#features">Tutorías</a></li>
          <li><a href="#steps">Cómo funciona</a></li>
          <li><Link to="/login" className="lnav__signin">Iniciar sesión</Link></li>
          <li><Link to="/register" className="lnav__cta">Registrarse gratis</Link></li>
        </ul>
      </div>
    </nav>
  )
}

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__bg">
        <div className="hero__shape hero__shape--1" />
        <div className="hero__shape hero__shape--2" />
        <div className="hero__shape hero__shape--3" />
      </div>
      <div className="landing-container hero__content">
        <div className="hero__badge">🇨🇱 Plataforma oficial del colegio</div>
        <h1 className="hero__title">
          Impulsa tu carrera en<br />
          <span className="hero__accent">Diseño Industrial</span>
        </h1>
        <p className="hero__desc">
          La plataforma del Colegio de Diseñadores Industriales de Chile.
          Accede a tutorías especializadas, gestiona tu membresía y conecta
          con una comunidad de más de 2.400 profesionales.
        </p>
        <div className="hero__actions">
          <Link to="/register" className="hero-btn hero-btn--primary">
            Crear cuenta gratis
          </Link>
          <a href="#steps" className="hero-btn hero-btn--ghost">
            ¿Cómo funciona? →
          </a>
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const stats = [
    { value: '2.400+', label: 'Diseñadores activos' },
    { value: '180+',   label: 'Tutorías disponibles' },
    { value: '60+',    label: 'Instructores certificados' },
    { value: '98%',    label: 'Tasa de satisfacción' },
  ]
  return (
    <section className="lstats">
      <div className="landing-container">
        <div className="lstats__grid">
          {stats.map((s, i) => (
            <div key={i} className="lstats__item">
              <span className="lstats__value">{s.value}</span>
              <span className="lstats__label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    { icon: '◈', title: 'Tutorías especializadas',  desc: 'Aprende de los mejores profesionales del diseño industrial con contenido en PDF y video siempre actualizado.' },
    { icon: '◆', title: 'Membresía profesional',    desc: 'Planes mensual, anual y senior. Acceso completo a todos los recursos y materiales de la plataforma.' },
    { icon: '◉', title: 'Comunidad activa',          desc: 'Conecta con diseñadores de todo Chile. Participa en talleres, eventos y proyectos colaborativos.' },
    { icon: '▣', title: 'Certificados oficiales',    desc: 'Obtén certificados reconocidos por el colegio que validan tus competencias ante empleadores.' },
    { icon: '◇', title: 'Pago 100% seguro',          desc: 'Integración con pasarela Flow. Tus datos financieros protegidos con cifrado TLS en todo momento.' },
    { icon: '○', title: 'Soporte continuo',           desc: 'Equipo de soporte disponible para ayudarte con cualquier duda o problema técnico que puedas tener.' },
  ]
  return (
    <section className="lfeatures" id="features">
      <div className="landing-container">
        <div className="lsection-header">
          <span className="lsection-header__tag">Características</span>
          <h2>Todo lo que necesitas para crecer</h2>
          <p>Una plataforma diseñada por y para diseñadores industriales chilenos.</p>
        </div>
        <div className="lfeatures__grid">
          {features.map((f, i) => (
            <div key={i} className="lfeature-card">
              <div className="lfeature-card__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StepsSection() {
  const steps = [
    { num: '01', title: 'Crea tu cuenta',        desc: 'Regístrate gratis como diseñador en menos de 2 minutos. Sin tarjeta requerida.' },
    { num: '02', title: 'Elige tu membresía',    desc: 'Selecciona el plan mensual, anual o senior que mejor se adapte a tus metas.' },
    { num: '03', title: 'Explora el catálogo',   desc: 'Accede a cientos de tutorías especializadas en diseño industrial chileno.' },
    { num: '04', title: 'Crece profesionalmente', desc: 'Obtén certificados reconocidos y conecta con la comunidad CODICH.' },
  ]
  return (
    <section className="lsteps" id="steps">
      <div className="landing-container">
        <div className="lsection-header">
          <span className="lsection-header__tag">Proceso</span>
          <h2>¿Cómo funciona?</h2>
          <p>Comenzar es simple y rápido. En cuatro pasos estarás aprendiendo.</p>
        </div>
        <div className="lsteps__grid">
          {steps.map((s, i) => (
            <div key={i} className="lstep-card">
              <span className="lstep-card__num">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section className="lcta">
      <div className="landing-container lcta__inner">
        <div>
          <h2 className="lcta__title">¿Listo para impulsar tu carrera?</h2>
          <p className="lcta__desc">Únete a más de 2.400 diseñadores que ya son parte de CODICH.</p>
        </div>
        <Link to="/register" className="lcta__btn">Crear cuenta gratis →</Link>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="lfooter">
      <div className="landing-container">
        <div className="lfooter__grid">

          <div className="lfooter__brand">
            <span className="lfooter__logo">CODICH</span>
            <p>Colegio de Diseñadores Industriales de Chile. Plataforma oficial de gestión académica y profesional para la comunidad del diseño.</p>
          </div>

          <div className="lfooter__col">
            <h4>Plataforma</h4>
            <ul>
              <li><a href="#features">Tutorías</a></li>
              <li><a href="#steps">Cómo funciona</a></li>
              <li><Link to="/register">Registrarse</Link></li>
              <li><Link to="/login">Iniciar sesión</Link></li>
            </ul>
          </div>

          <div className="lfooter__col">
            <h4>Empresa</h4>
            <ul>
              <li><a href="#">Sobre CODICH</a></li>
              <li><a href="#">Política de privacidad</a></li>
              <li><a href="#">Términos de uso</a></li>
              <li><a href="#">Contacto</a></li>
            </ul>
          </div>

          <div className="lfooter__col lfooter__staff-col">
            <h4>Área de trabajo</h4>
            <p className="lfooter__staff-desc">¿Eres instructor o administrador? Accede a tu panel aquí.</p>
            <ul>
              <li>
                <Link to="/instructor/login" className="lfooter__staff-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  Acceso instructores
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="lfooter__staff-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Portal administradores
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="lfooter__bottom">
          <span>© 2026 CODICH Chile — Todos los derechos reservados</span>
          <span>Ingeniería de Software 2 · UNAB · NRC 7975</span>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  const { usuario } = useContext(AuthContext)
  if (usuario) return <Navigate to={RUTA_POR_ROL[usuario.rol] || '/login'} replace />

  return (
    <div className="landing">
      <LandingNav />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <StepsSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
