import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Sistema de Préstamos</div>
      <ul className="navbar-links">
        <li><NavLink to="/dashboard">Dashboard</NavLink></li>
        <li><NavLink to="/herramientas">Herramientas</NavLink></li>
        <li><NavLink to="/prestamos">Préstamos</NavLink></li>
        <li><NavLink to="/alertas">Alertas</NavLink></li>
      </ul>
    </nav>
  );
}
