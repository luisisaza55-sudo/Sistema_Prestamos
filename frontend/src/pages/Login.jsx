/**
 * Login - Pantalla de inicio de sesión.
 * Valida credenciales contra users.js y guarda sesión en sessionStorage.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../auth/users';
import { HardHat, User, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); setCargando(true);
    setTimeout(() => {
      const u = login(username.trim(), password);
      if (u) navigate('/dashboard', { replace: true });
      else   setError('Usuario o contraseña incorrectos');
      setCargando(false);
    }, 300);
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon"><HardHat size={32} strokeWidth={2.2} /></div>
          <h1>Sistema de Préstamos</h1>
          <p>Conjunto Residencial</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuario</label>
            <div className="login-input">
              <User size={16} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="login-input">
              <Lock size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button type="submit" className="btn btn-primary login-btn" disabled={cargando}>
            <LogIn size={16} /> {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-hint">
          <strong>Usuarios de prueba:</strong>
          <div>admin / admin123</div>
          <div>porteria / porteria123</div>
        </div>
      </div>
    </div>
  );
}
