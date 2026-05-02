/**
 * Sidebar - Barra lateral con navegación, datos del usuario y botón de logout.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  AlertTriangle,
  HardHat,
  UserCog,
  LogOut,
} from 'lucide-react';
import { getUser, logout } from '../auth/users';

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/herramientas', icon: Wrench,           label: 'Herramientas' },
  { to: '/prestamos',    icon: ClipboardList,    label: 'Préstamos'    },
  { to: '/alertas',      icon: AlertTriangle,    label: 'Alertas'      },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = getUser();

  const cerrarSesion = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <HardHat size={22} strokeWidth={2.2} />
        </div>
        <div className="sidebar-logo-text">
          Sistema de Préstamos
          <span>Conjunto Residencial</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <UserCog size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="sidebar-user-name">{user?.nombre || 'Usuario'}</div>
            <div className="sidebar-user-role">{user?.rol || ''}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={cerrarSesion} title="Cerrar sesión">
          <LogOut size={15} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
